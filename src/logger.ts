import winston from "winston";

// TODO: Create conditional to log when running tests
const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    data: 3
  },
  colors: {
    error: 'bold red blackBG',
    warn: "bold yellow blackBG",
    info: "green blackBG",
    data: "italic blue blackBG"
  },
  errorFilename: './logs/error.log',
  dataFilename: './logs/data.log',
  standardFormat: winston.format.printf( ( { level, message, label } ) =>
  {
    return `${ level } [${ label }] : ${ message }`;
  } ),
  dataFormat: winston.format.printf( ( { level, message, label, timestamp } ) =>
  {
    return `${ timestamp }\t ${ level.toUpperCase() } [${ label }] : ${ message }`;
  } )
};

export default function ( moduleName:string ): winston.Logger
{
  return winston.createLogger( {
    levels: config.levels,
    transports: [
      new winston.transports.Console( {
        level: process.env.NODE_ENV === 'debug' ? 'data' : 'info',
        format: winston.format.combine(
          winston.format.splat(),
          winston.format.colorize( config ),
          winston.format.label( { label: moduleName } ),
          config.standardFormat
        ),
        silent : process.env.NODE_ENV === 'test'? true : false
      } ),
      new winston.transports.File( {
        filename: config.errorFilename,
        level: 'error',
        format: winston.format.combine(
          winston.format.splat(),
          winston.format.label( { label: moduleName } ),
          winston.format.timestamp( { format: "MM-DD-YYYY HH:mm:ss" } ),
          config.dataFormat
        )
      } ),
      new winston.transports.File( {
        filename: config.dataFilename,
        level: 'data',
        format: winston.format.combine(
          winston.format.splat(),
          winston.format.timestamp( { format: "MM-DD-YYYY HH:mm:ss" } ),
          winston.format.label( { label: moduleName } ),
          config.dataFormat
        )
      } )
    ]
  } );
};;