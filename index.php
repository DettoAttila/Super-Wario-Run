<!DOCTYPE html>
<html lang="it">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Wario Run</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="style.css">
  </head>

  <body>
    
    <div class="container">
      <!-- CANVAS -->
      <div id="gioco">
        <div id="schermata">
          <img src="assets/img/monitor0.png" id="monitor0" alt="">
          <canvas id="schermata_gioco"></canvas>
        </div>
        <br>
        Controls: SPACE to jump, &rarr; to dash.
      </div>

      <!-- CLASSIFICA -->
      <div id="classifica">

      </div>

      <!-- JS -->
      <script src="./lib/sat-js-master/SAT.js"></script>
      <script type="module" src="main.js"></script>
    </div>

    <a class="manuale" href="manuale.html">Clicca qui per leggere il manuale</a>

    <footer>
      This product was not made or endorsed by Nintendo. All rights reserved.<br>
      <br>
      <b><u>Credits</u></b>: <br>
      <b>Graphics</b>: The Spriters Resource, A. J. Nitro, TGS13, cheat-master30, SMWCentral, Falconpunch, DarkYoshi, DIRGE, cl.exe <br>
      <b>Sound</b>: The Sounds Resource, Weario, specularbark45, King_Harkinian <br>
      <b>Font</b>: heaven castro <br>
      <b>Libraries</b>: jriecken <br>
      <!--
      <br>
      <b><u>Special Thanks</u></b>: -->
    </footer>
  </body>

</html>