@ECHO OFF
REM This script is intended to be used for launching OpenFin Runtime by ChromeDriver or node of Selenium Grid server.
REM It parses --remote-debugging-port and --config parameters passed by ChromeDriver and passes them to OpenFinRVM.exe
REM %openfinLocation% needs to point to location of OpenFin install directory.
REM devtools_port should NOT be set in app manifest json file

SETLOCAL ENABLEDELAYEDEXPANSION
SETLOCAL ENABLEEXTENSIONS

SET args= 

:loop  
 IF "%1"=="" GOTO cont  
 SET opt=%1
 SET opt2=%2
 IF "%2" == "" (
	SET opt2Check=%opt2% 
 ) ELSE ( 
	SET opt2Check=%opt2:"=%
 )
 IF "%opt%" == "--config" (
    SET startupURL=%2
    GOTO doubleshift
 ) ELSE (
    IF "%opt%" == "data:" (
      echo "skipping data:"
    ) ELSE (
       IF "%opt:~0,2%" == "--" (
       	IF "%opt2Check:~0,2%" == "--" (
         SET args=%args% %1
       	) ELSE (
	   IF "%opt2Check%" == "" (
             SET args=%args% %1
           ) ELSE (
             IF "%opt2Check%" == "data:" (
 	        SET args=%args% %1
             ) ELSE (
             	SET args=%args% %1=%2
             	GOTO doubleshift
             )
           )
         )
       )
    )
 )

 SHIFT & GOTO loop  

:doubleshift
 SHIFT & SHIFT & GOTO loop  

:cont

SET openfinLocation=%LocalAppData%\OpenFin

%openfinLocation%\OpenFinRVM.exe --config=%startupURL% --runtime-arguments="%args%"

ENDLOCAL

