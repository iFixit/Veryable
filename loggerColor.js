import winston from "winston";
//
// Logging levels
//
const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    custom: 7
  },
  colors: {
    error: 'bold red blackBG',
    debug: 'blue',
    warn: "italic blue blackBG",
    data: 'grey',
    info: "green blackBG",
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow'
  }
};

winston.addColors( config.colors );

const logger = winston.createLogger( {
  levels: config.levels,
  format: winston.format.combine(
    winston.format.colorize(), // Can pass {all: true } to color message as well
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ],
  level: 'custom'
} );

logger.custom( 'hello' );
logger.info( 'HGello W' );
logger.log( {
  level: 'info',
  message: 'Pass an object and this works',
  additional: 'properties',
  are: 'passed along'
} );

logger.info( {
  message: 'Use a helper method if you want',
  additional: 'properties',
  are: 'passed along'
} );

// ***************
// Allows for parameter-based logging
// ***************

logger.log( 'info', 'Pass a message and this works', {
  additional: 'properties',
  are: 'passed along'
} );

logger.info( 'Use a helper method if you want', {
  additional: 'properties',
  are: 'passed along'
} );


// ***************
// Allows for logging Error instances
// ***************

logger.warn( new Error( 'Error passed as info' ) );
logger.log( 'error', new Error( 'Error passed as message' ) );

logger.warn( 'Maybe important error: ', new Error( 'Error passed as meta' ) );
logger.log( 'error', 'Important error: ', new Error( 'Error passed as meta' ) );

logger.error( new Error( 'Error as info' ) );