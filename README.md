# eyeling-processor-ts

[![Build and tests with Node.js](https://github.com/pheyvaer/eyeling-processor-ts/actions/workflows/build-test.yml/badge.svg)](https://github.com/pheyvaer/eyeling-processor-ts/actions/workflows/build-test.yml)

TypeScript RDF-Connect processor for [Eyeling](https://github.com/eyereasoner/eyeling).
It only supports Eyeling's [reason function](https://github.com/eyereasoner/eyeling/#reasonoptions-input) 
with [multi-source input](https://github.com/eyereasoner/eyeling/#multi-source-input).
At the moment, the processor only supports the default options. 

## Production usage

To use this processor in your RDF-Connect pipeline,
you need to have a pipeline configuration that includes the [rdfc:NodeRunner](https://github.com/rdf-connect/js-runner).
Check out their documentation to find out how to install and configure it.

Next, you add the processor to your pipeline configuration as follows:

```turtle
@prefix rdfc: <https://w3id.org/rdf-connect#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.

# Import the processor
<> owl:imports <./node_modules/eyeling-processor-ts/processor.ttl>.

### Define the channels your processor needs
<data1> a rdfc:Writer, rdfc:Reader.
<data2> a rdfc:Writer, rdfc:Reader.
<rules> a rdfc:Writer, rdfc:Reader.
<output> a rdfc:Writer, rdfc:Reader.

# Attach the processor to the pipeline under the NodeRunner
# Add the `rdfc:processor <eyeling>` statement under the `rdfc:consistsOf` statement of the `rdfc:NodeRunner`

# Define and configure the processor
<eyeling> a eyeling:EyelingProcessorTs;
    eyeling:rules <rules>;
    eyeling:input <data1>, <data2>;
    rdfc:writer <output>;
    eyeling:writerFormat "text/turtle". # This is optional. The default is N-Triples.
```

## Development usage

1. Install the dependencies via

   ```bash
   npm install
   ```

2. Build the code via

   ```bash
   npm run build
   ```

3. Run the tests via

   ```bash
   npm test
   ```

### Logging

The JavaScript runner and processors use the `winston` logging library for logging.
The JavaScript runner initiates a logger that is passed to each processor,
allowing them to log messages at various levels (info, warn, error, debug).
You can access this logger in your processor class code on the `this.logger` property.
Here's an example of how to use the logger in a processor:

```typescript
import { Processor } from '@rdfc/js-runner'

class MyProcessor extends Processor<MyProcessorArgs> {
  async init(this: MyProcessorArgs & this): Promise<void> {
    this.logger.info('I am initializing my processor!')
  }
  // ...
}
```

This logger is configured to forward log messages to the RDF-Connect logging system.
This means you can view and manage these logs in the RDF-Connect logging interface,
allowing for consistent log management across different components of your RDF-Connect pipeline.

If you want to create a child logger for a subclass or submethod, you can do so using the `extendLogger` method.
Here's an example:

```typescript
import { Processor, extendLogger } from '@rdfc/js-runner'

class MyProcessor extends Processor<MyProcessorArgs> {
  async init(this: MyProcessorArgs & this): Promise<void> {
    const childLogger = extendLogger(this.logger, 'init')
    childLogger.debug('This is a debug message from init.')
  }
  // ...
}
```

### Project Structure

```text
template-processor-ts/      # Root directory of the project
├── .github/                # CI/CD configuration files for GitHub Actions and Renovate dependency updates
├── src/                    # Source code directory
│   └── index.ts            # Contains the main logic for the JS/TS processor
├── tests/                  # Directory for unit tests
│   ├── index.test.ts       # Functional tests for the processor logic
│   └── processor.test.ts   # Processor initialization tests
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration file
└── processor.ttl           # RDF schema for the processor, used for metadata and configuration
```
