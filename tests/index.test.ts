import { describe, expect, test } from "vitest";
import { EyelingProcessor } from "../src";
import { channel, createRunner } from "@rdfc/js-runner/lib/testUtils";
import { FullProc } from "@rdfc/js-runner";
import { createLogger } from "winston";

describe("Functional tests for the Eyeling processor", () => {
    test("It writes everything from the reader", async () => {
        const runner = createRunner();

        const [inputWriter1, inputReader1] = channel(runner, "incoming1");
        const [inputWriter2, inputReader2] = channel(runner, "incoming2");
        const [outputWriter, outputReader] = channel(runner, "outgoing");

        // Read output
        const output: string[] = [];
        (async () => {
            for await (const msg of outputReader.strings()) {
                output.push(msg);
            }
            return output;
        })().then();

        // Initialize the processor.
        const startEyelingProcessor = <FullProc<EyelingProcessor>>(
            new EyelingProcessor(
                {
                    sources: [inputReader1, inputReader2],
                    writer: outputWriter,
                },
                createLogger(),
            )
        );
        await startEyelingProcessor.init();

        const outputPromise = Promise.all([
            startEyelingProcessor.transform(),
            startEyelingProcessor.produce(),
        ]);

        // Push messages into input
        await inputWriter1.string(
            "@prefix : <http://example.org/> . :Socrates a :Man .",
        );
        await inputWriter1.close();

        await inputWriter2.string(
            "@prefix : <http://example.org/> . { ?x a :Man } => { ?x a :Mortal } .",
        );
        await inputWriter2.close();

        // Wait for the processor to finish.
        await outputPromise;

        // Assertions on output data
        expect(output).toEqual([
            "@prefix : <http://example.org/> .\n" +
                "\n" +
                ":Socrates a :Mortal .\n",
        ]);
    });
});
