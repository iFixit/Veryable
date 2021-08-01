import winston from "winston";
const { format, transports } = winston;


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
  }
};


export default function ( moduleName )
{
  return new winston.createLogger( {
    levels: config.levels,
    format: format.combine(
      format.label( { label: moduleName } ),
      format.colorize( config.colors ),
      format.printf( ( { level, message, label } ) =>
      {
        return `${ level } [${ label }] : ${ message } `;
      } )
      ,
    ),
    transports: [
      new winston.transports.Console()
    ]
  } );
};