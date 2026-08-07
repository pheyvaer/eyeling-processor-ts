import { describe, expect, test } from "vitest";
import { ProcHelper } from "@rdfc/js-runner/lib/testUtils";
import { resolve } from "path";
import { NamedNode } from "n3";

import { EyelingArgs, EyelingProcessor } from "../src";

const pipeline = `
        @prefix rdfc: <https://w3id.org/rdf-connect#>.
        @prefix eyeling: <https://eyereasoner.github.io/eyeling#>.

        <http://example.com/processor> a eyeling:EyelingProcessorTs;
          rdfc:reader <incoming1>, <incoming2>;
          rdfc:writer <outgoing>.
        `;

describe("Eyeling processor tests", async () => {
    test("rdfc:EyelingProcessorTs is properly defined", async () => {
        const helper = new ProcHelper<EyelingProcessor>();

        await helper.importFile(resolve("./processor.ttl"));
        await helper.importInline("./pipeline.ttl", pipeline);

        const config = helper.getConfig(
            new NamedNode(
                "https://eyereasoner.github.io/eyeling#EyelingProcessorTs",
            ),
        );

        expect(config.location).toBeDefined();
        expect(config.clazz).toBe("EyelingProcessor");
        expect(config.file).toBeDefined();

        const proc = <EyelingProcessor & EyelingArgs>(
            await helper.getProcessor("http://example.com/processor")
        );

        expect(proc.reader.constructor.name).toBe("Array");
        expect(proc.writer?.constructor.name).toBe("WriterInstance");

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait a bit for the reading to complete
    });
});
