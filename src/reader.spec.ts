import * as fs from 'fs';
import mmdb = require('maxmind');
import {
  AddressNotFoundError,
  InvalidDbBufferError,
  UnknownError,
} from './errors';
import Reader from './reader';
import ReaderModel from './readerModel';

describe('Reader', () => {
  describe('open()', () => {
    const file = './test/data/test-data/GeoIP2-City-Test.mmdb';

    it('passes the file to node-maxmind and resolves', () => {
      const spy = jest.spyOn(mmdb, 'open');

      expect.assertions(2);

      return Reader.open(file).then((reader) => {
        expect(spy).toHaveBeenCalledWith(file, undefined);
        expect(reader).toBeInstanceOf(ReaderModel);
      });
    });

    it('passes the file and options to node-maxmind and resolves', () => {
      const spy = jest.spyOn(mmdb, 'open');
      const options = {
        cache: {
          max: 100,
        },
      };

      expect.assertions(2);

      return Reader.open(file, options).then((reader) => {
        expect(spy).toHaveBeenCalledWith(file, options);
        expect(reader).toBeInstanceOf(ReaderModel);
      });
    });

    it('rejects the promise if node-maxmind errors out', () => {
      return expect(Reader.open('fail.test')).rejects.toThrowError(
        "ENOENT: no such file or directory, open 'fail.test'"
      );
    });
  });

  describe('openBuffer()', () => {
    const file = './test/data/test-data/GeoIP2-City-Test.mmdb';

    it('returns a reader model if the buffer is a valid DB', async () => {
      const buffer = fs.readFileSync(file);
      expect(Reader.openBuffer(buffer)).toBeInstanceOf(ReaderModel);
    });

    describe('errors', () => {
      it('throws an InvalidDbBufferError if buffer is not a valid DB', () => {
        expect(() => Reader.openBuffer(Buffer.from('foo'))).toThrow(
          new InvalidDbBufferError('Unknown type 109 at offset 1')
        );
      });

      it('throws an InvalidDbBufferError thrown error is a string', async () => {
        const message = 'foo message';

        jest.resetModules();
        const actual = jest.requireActual('maxmind');

        jest.doMock('maxmind', () => {
          return {
            ...actual,
            Reader: jest.fn(() => {
              throw message;
            }),
          };
        });

        const mockedReader: typeof Reader = await (
          await import('./reader')
        ).default;

        expect(() => mockedReader.openBuffer(Buffer.from('foo'))).toThrow(
          new InvalidDbBufferError(message)
        );
      });

      it('throws an UnknownError if error is a not an Error instance or string', async () => {
        const message = 1;

        jest.resetModules();
        const actual = jest.requireActual('maxmind');

        jest.doMock('maxmind', () => {
          return {
            ...actual,
            Reader: jest.fn(() => {
              throw message;
            }),
          };
        });

        const mockedReader: typeof Reader = await (
          await import('./reader')
        ).default;

        expect(() => mockedReader.openBuffer(Buffer.from('foo'))).toThrow(
          'An unknown error has occured.'
        );
      });
    });
  });
});
