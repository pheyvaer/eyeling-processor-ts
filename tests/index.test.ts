import { describe, expect, test } from "vitest";
import { EyelingProcessor } from "../src";
import { channel, createRunner } from "@rdfc/js-runner/lib/testUtils";
import { FullProc } from "@rdfc/js-runner";
import { createLogger } from "winston";

describe("Functional tests for the Eyeling processor", () => {
  test("1 input with 1 message", async () => {
    const runner = createRunner();

    const [rulesWriter, rulesReader] = channel(runner, "rules");
    const [inputWriter, inputReader] = channel(runner, "input");
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
          rules: rulesReader,
          input: [inputReader],
          writer: outputWriter,
          writerFormat: "text/turtle",
        },
        createLogger(),
      )
    );

    await startEyelingProcessor.init();

    const outputPromise = Promise.all([
      startEyelingProcessor.transform(),
      startEyelingProcessor.produce(),
    ]);

    await rulesWriter.string(
      "@prefix : <http://example.org/> . { ?x a :Person } => { ?x a :Mortal } .",
    );
    await rulesWriter.close();

    // Push messages into input
    await inputWriter.string(
      "@prefix : <http://example.org/> . :Socrates a :Person .",
    );

    await inputWriter.close();
    // Wait for the processor to finish.
    await outputPromise;

    // Assertions on output data
    expect(output).toEqual([
      "@prefix : <http://example.org/> .\n" + "\n" + ":Socrates a :Mortal .\n",
    ]);
  });

  test("1 input with 2 messages", async () => {
    const runner = createRunner();

    const [rulesWriter, rulesReader] = channel(runner, "rules");
    const [inputWriter, inputReader] = channel(runner, "input");
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
          rules: rulesReader,
          input: [inputReader],
          writer: outputWriter,
          writerFormat: "text/turtle",
        },
        createLogger(),
      )
    );

    await startEyelingProcessor.init();

    const outputPromise = Promise.all([
      startEyelingProcessor.transform(),
      startEyelingProcessor.produce(),
    ]);

    await rulesWriter.string(
      "@prefix : <http://example.org/> . { ?x a :Person } => { ?x a :Mortal } .",
    );
    await rulesWriter.close();

    // Push messages into input
    await inputWriter.string(
      "@prefix : <http://example.org/> . :Socrates a :Person .",
    );

    await inputWriter.string(
      "@prefix : <http://example.org/> . :Sofia a :Person .",
    );

    await inputWriter.close();
    // Wait for the processor to finish.
    await outputPromise;

    // Assertions on output data
    expect(output).toEqual([
      "@prefix : <http://example.org/> .\n" + "\n" + ":Socrates a :Mortal .\n",
      "@prefix : <http://example.org/> .\n" +
        "\n" +
        ":Socrates a :Mortal .\n:Sofia a :Mortal .\n",
    ]);
  });

  test("2 inputs with 1 message each", async () => {
    const runner = createRunner();

    const [rulesWriter, rulesReader] = channel(runner, "rules");
    const [inputWriter1, inputReader1] = channel(runner, "input1");
    const [inputWriter2, inputReader2] = channel(runner, "input2");
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
          rules: rulesReader,
          input: [inputReader1, inputReader2],
          writer: outputWriter,
          writerFormat: "text/turtle",
        },
        createLogger(),
      )
    );

    await startEyelingProcessor.init();

    const outputPromise = Promise.all([
      startEyelingProcessor.transform(),
      startEyelingProcessor.produce(),
    ]);

    await rulesWriter.string(
      "@prefix : <http://example.org/> . { ?x a :Person } => { ?x a :Mortal } .",
    );
    await rulesWriter.close();

    // Push messages into inputs
    await inputWriter1.string(
      "@prefix : <http://example.org/> . :Socrates a :Person .",
    );

    await inputWriter2.string(
      "@prefix : <http://example.org/> . :Sofia a :Person .",
    );

    await inputWriter1.close();
    await inputWriter2.close();
    // Wait for the processor to finish.
    await outputPromise;

    // Assertions on output data
    expect(output).toEqual([
      "@prefix : <http://example.org/> .\n" + "\n" + ":Socrates a :Mortal .\n",
      "@prefix : <http://example.org/> .\n" +
        "\n" +
        ":Socrates a :Mortal .\n:Sofia a :Mortal .\n",
    ]);
  });

  test("Writer format is n-triples", async () => {
    const runner = createRunner();

    const [rulesWriter, rulesReader] = channel(runner, "rules");
    const [inputWriter, inputReader] = channel(runner, "input");
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
          rules: rulesReader,
          input: [inputReader],
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

    await rulesWriter.string(
      "@prefix : <http://example.org/> . { ?x a :Person } => { ?x a :Mortal } .",
    );
    await rulesWriter.close();

    // Push messages into input
    await inputWriter.string(
      "@prefix : <http://example.org/> . :Socrates a :Person .",
    );

    await inputWriter.close();
    // Wait for the processor to finish.
    await outputPromise;

    // Assertions on output data
    expect(output).toEqual([
      "<http://example.org/Socrates> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Mortal> .\n",
    ]);
  });

  test.skip("Socrates 2", async () => {
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
          rules: inputReader1,
          input: [inputReader2],
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
    await inputWriter2.string(
      "@prefix : <http://example.org/> . :Socrates a :Person .",
    );

    await inputWriter1.string(
      "@prefix : <http://example.org/> . { ?x a :Person } => { ?x a :Mortal } .",
    );

    await inputWriter2.close();
    await inputWriter1.close();

    // Wait for the processor to finish.
    await outputPromise;

    // Assertions on output data
    expect(output).toEqual([
      "@prefix : <http://example.org/> .\n" + "\n" + ":Socrates a :Mortal .\n",
    ]);
  });
});
