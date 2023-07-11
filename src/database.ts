import Database from 'better-sqlite3';
import path from 'path';

export default new Database( path.join( __dirname, '..', 'db.sqlite' ), {
    fileMustExist: true
} );
