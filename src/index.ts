import { Processor, type Reader, type Writer } from "@rdfc/js-runner";
import { reason } from "eyeling";

export type EyelingArgs = {
    reader: Array<Reader>;
    writer: Writer;
};

/**
 * The TemplateProcessor class is a very simple processor which simply logs the
 * incoming stream to the RDF-Connect logging system and pipes it directly into
 * the outgoing stream.
 *
 * @param incoming The data stream which must be logged.
 * @param outgoing The data stream into which the incoming stream is written.
 */
export class EyelingProcessor extends Processor<EyelingArgs> {
    /**
     * This is the first function that is called (and awaited) when creating a processor.
     * This is the perfect location to start things like database connections.
     */
    async init(this: EyelingArgs & this): Promise<void> {
        // Initialization code here e.g., setting up connections or loading resources
    }

    /**
     * Function to start reading channels.
     * This function is called for each processor before `produce` is called.
     * Listen to the incoming stream, log them, and push them to the outgoing stream.
     */
    async transform(this: EyelingArgs & this): Promise<void> {
        const promises = [];

        for (let i = 0; i < this.reader.length; i++) {
            this.logger.info("Processing reader " + i);
            const reader = this.reader[i];
            promises.push(this.streamToEye(reader));
        }

        const sourcesAsStrings = await Promise.all(promises);

        const output = reason(
            {},
            {
                sources: sourcesAsStrings,
            },
        );

        await this.writer.string(output);
        await this.writer.close();
    }

    /**
     * Function to start the production of data, starting the pipeline.
     * This function is called after all processors are completely set up.
     */
    async produce(this: EyelingArgs & this): Promise<void> {}

    async streamToEye(reader: Reader): Promise<string> {
        let sourceAsString = "";

        for await (const msg of reader.strings()) {
            this.logger.info(msg);
            sourceAsString += msg + "\n";
        }

        return sourceAsString;
    }
}
