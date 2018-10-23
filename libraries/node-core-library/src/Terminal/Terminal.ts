// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { EOL, type } from 'os';

import { ITerminalProvider, Severity } from './ITerminalProvider';
import { Text } from '../Text';
import { IColorableSequence, Color } from '../Colors';

/**
 * This class facilitates writing to a console.
 *
 * @beta
 */
export class Terminal {
  public verboseEnabled: boolean;

  private _providers: Set<ITerminalProvider>;

  public constructor(provider: ITerminalProvider, verboseEnabled: boolean = false) {
    this._providers = new Set<ITerminalProvider>();
    this._providers.add(provider);

    this.verboseEnabled = verboseEnabled;
  }

  public registerProvider(provider: ITerminalProvider): void {
    this._providers.add(provider);
  }

  public unregisterProvider(provider: ITerminalProvider): void {
    if (this._providers.has(provider)) {
      this._providers.delete(provider);
    }
  }

  /**
   * Write a generic message to the terminal
   */
  public write(...messageParts: (string | IColorableSequence)[]): void {
    this._writeSegmentsToProviders([...messageParts, { text: EOL }], Severity.log);
  }

  /**
   * Write a generic message to the terminal, followed by a newline
   */
  public writeLine(...messageParts: (string | IColorableSequence)[]): void {
    this.write(...messageParts, { text: EOL });
  }

  /**
   * Write a warning message to the console with yellow text.
   */
  public writeWarning(...messageParts: (string | IColorableSequence)[]): void {
    this._writeSegmentsToProviders(
      messageParts.map(
        (part) => ({ ...(typeof part === 'string' ? { text: part } : part), foregroundColor: Color.Yellow })
      ),
      Severity.warn
    );
  }

  /**
   * Write a warning message to the console with yellow text, followed by a newline.
   */
  public writeWarningLine(...messageParts: (string | IColorableSequence)[]): void {
    this._writeSegmentsToProviders(
      [
        ...messageParts.map(
          (part) => ({ ...(typeof part === 'string' ? { text: part } : part), foregroundColor: Color.Yellow })
        ),
        { text: EOL }
      ],
      Severity.warn
    );
  }

  /**
   * Write an error message to the console with red text.
   */
  public writeError(...messageParts: (string | IColorableSequence)[]): void {
    this._writeSegmentsToProviders(
      messageParts.map(
        (part) => ({ ...(typeof part === 'string' ? { text: part } : part), foregroundColor: Color.Red })
      ),
      Severity.warn
    );
  }

  /**
   * Write an error message to the console with red text, followed by a newline.
   */
  public writeErrorLine(...messageParts: (string | IColorableSequence)[]): void {
    this._writeSegmentsToProviders(
      [
        ...messageParts.map(
          (part) => ({ ...(typeof part === 'string' ? { text: part } : part), foregroundColor: Color.Yellow })
        ),
        { text: EOL }
      ],
      Severity.warn
    );
  }

  /**
   * Write a verbose-level message. Messages are only written if verbose mode is turned on.
   */
  public writeVerbose(...messageParts: (string | IColorableSequence)[]): void {
    if (this.verboseEnabled) {
      this._writeSegmentsToProviders(messageParts, Severity.log);
    }
  }

  /**
   * Write a verbose-level message followed by a newline. Messages are only written if verbose mode is turned on.
   */
  public writeVerboseLine(...messageParts: (string | IColorableSequence)[]): void {
    this.writeVerboseLine(...messageParts, { text: EOL });
  }

  private _writeSegmentsToProviders(segments: (string | IColorableSequence)[], severity: Severity): void {
    let withColor: string;
    let withoutColor: string;

    this._providers.forEach((provider) => {
      const textToWrite: string = provider.supportsColor
        ? (withColor || (withColor = this._serializeFormattableTextSegments(segments, true)))
        : (withoutColor || (withoutColor = this._serializeFormattableTextSegments(segments, false)));
      provider.write(textToWrite, severity);
    });
  }

  private _serializeFormattableTextSegments(segments: (string | IColorableSequence)[], withColor: boolean): string {
    const segmentsToJoin: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      let segment: string | IColorableSequence = segments[i];
      if (withColor) {
        if (typeof segment === 'string') {
          segment = { text: segment };
        }

        const startColorCodes: number[] = [];
        const endColorCodes: number[] = [];
        switch (segment.foregroundColor) {
          case Color.Black: {
            startColorCodes.push(30);
            endColorCodes.push(39);
            break;
          }

          case Color.Red: {
            startColorCodes.push(31);
            endColorCodes.push(39);
            break;
          }

          case Color.Green: {
            startColorCodes.push(32);
            endColorCodes.push(39);
            break;
          }

          case Color.Yellow: {
            startColorCodes.push(33);
            endColorCodes.push(39);
            break;
          }

          case Color.Blue: {
            startColorCodes.push(34);
            endColorCodes.push(39);
            break;
          }

          case Color.Magenta: {
            startColorCodes.push(35);
            endColorCodes.push(39);
            break;
          }

          case Color.Cyan: {
            startColorCodes.push(36);
            endColorCodes.push(39);
            break;
          }

          case Color.White: {
            startColorCodes.push(37);
            endColorCodes.push(39);
            break;
          }

          case Color.Gray: {
            startColorCodes.push(90);
            endColorCodes.push(39);
            break;
          }
        }

        switch (segment.backgroundColor) {
          case Color.Black: {
            startColorCodes.push(40);
            endColorCodes.push(49);
            break;
          }

          case Color.Red: {
            startColorCodes.push(41);
            endColorCodes.push(49);
            break;
          }

          case Color.Green: {
            startColorCodes.push(42);
            endColorCodes.push(49);
            break;
          }

          case Color.Yellow: {
            startColorCodes.push(43);
            endColorCodes.push(49);
            break;
          }

          case Color.Blue: {
            startColorCodes.push(44);
            endColorCodes.push(49);
            break;
          }

          case Color.Magenta: {
            startColorCodes.push(45);
            endColorCodes.push(49);
            break;
          }

          case Color.Cyan: {
            startColorCodes.push(46);
            endColorCodes.push(49);
            break;
          }

          case Color.White: {
            startColorCodes.push(47);
            endColorCodes.push(49);
            break;
          }

          case Color.Gray: {
            startColorCodes.push(100);
            endColorCodes.push(49);
            break;
          }
        }

        for (let i = 0; i < startColorCodes.length; i++) {
          const code: number = startColorCodes[i];
          segmentsToJoin.push(...[
            '\u001b[',
            code.toString(),
            'm'
          ]);
        }

        segmentsToJoin.push(segment.text);

        for (let i = endColorCodes.length - 1; i >= 0; i--) {
          const code: number = endColorCodes[i];
          segmentsToJoin.push(...[
            '\u001b[',
            code.toString(),
            'm'
          ]);
        }
      } else {
        segmentsToJoin.push(typeof segment === 'string' ? segment : segment.text);
      }
    };

    return segmentsToJoin.join('');
  }
}
