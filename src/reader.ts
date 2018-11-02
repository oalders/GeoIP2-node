import mmdb = require('maxmind');
import ReaderModel from './readerModel';

/** Class representing the mmdb reader **/
export default class Reader {
  /**
   * Opens a mmdb file and returns a ReaderModel promise
   *
   * @param file The file to open
   * @param opts Options for opening the file.  See https://github.com/runk/node-maxmind#options
   */
  public static open(file: string, opts?: mmdb.IOpenOpts): Promise<any> {
    return new Promise((resolve, reject) => {
      mmdb.open(file, opts, (err: Error, reader: mmdb.IReader) => {
        if (err) {
          return reject(err);
        }
        return resolve(new ReaderModel(reader));
      });
    });
  }
}
