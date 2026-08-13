import { Processor, type Reader, type Writer } from "@rdfc/js-runner";
import { reason } from "eyeling";
import N3 from "n3";

export type EyelingArgs = {
  input: Array<Reader>;
  rules: Reader;
  writer: Writer;
  writerFormat: string;
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
  private rulesAsString: string;
  private dataAsStrings: Array<string>;

  /**
   * This is the first function that is called (and awaited) when creating a processor.
   * This is the perfect location to start things like database connections.
   */
  async init(this: EyelingArgs & this): Promise<void> {
    this.writerFormat = this.writerFormat ?? "N-triples";
  }

  /**
   * Function to start reading channels.
   * This function is called for each processor before `produce` is called.
   * Listen to the incoming stream, log them, and push them to the outgoing stream.
   */
  async transform(this: EyelingArgs & this): Promise<void> {
    this.rulesAsString = await this.streamToString(this.rules);
    this.dataAsStrings = [this.rulesAsString];

    for (let i = 0; i < this.input.length; i++) {
      const input = this.input[i];

      (async () => {
        for await (const msg of input.strings()) {
          this.logger.info("New data :" + msg);
          this.dataAsStrings.push(msg);
          let output = reason(
            {},
            {
              sources: this.dataAsStrings,
            },
          );

          this.logger.info(output);

          if (this.writerFormat !== "text/turtle") {
            output = await this.convertTurtle(output, this.writerFormat);
          }

          await this.writer.string(output);
        }
      })().then();
    }
  }

  /**
   * Function to start the production of data, starting the pipeline.
   * This function is called after all processors are completely set up.
   */
  async produce(this: EyelingArgs & this): Promise<void> {}

  async streamToString(reader: Reader): Promise<string> {
    let dataAsString = "";

    for await (const msg of reader.strings()) {
      this.logger.info(msg);
      dataAsString += msg + "\n";
    }

    return dataAsString;
  }

  convertTurtle(turtle: string, format: string): Promise<string> {
    const parser = new N3.Parser();
    const writer = new N3.Writer({ format });

    return new Promise((resolve, reject) => {
      parser.parse(turtle, (error, quad) => {
        if (error) {
          reject(error);
        }

        if (quad) {
          writer.addQuad(quad);
        } else {
          writer.end((error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        }
      });
    });
  }
}
