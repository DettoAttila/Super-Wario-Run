<!DOCTYPE html>
<html lang="it">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Wario Run</title>
    <link rel="stylesheet" href="style.css">
  </head>

  <body>
    
    <div class="container">
      <!-- CANVAS -->
      <section id="gioco">
        <div id="schermata">
          <img src="assets/monitor0.png" id="monitor0">
          <canvas id="schermata_gioco"></canvas>
        </div>
      </section>

      <!-- CLASSIFICA -->
      <section id="classifica">

      </section>

      <!-- JS -->
      <script src="./lib/sat-js-master/SAT.js"></script>
      <script type="module" src="main.js"></script>
    </div>

    <footer>This product was not made or endorsed by Nintendo. All rights reserved.</footer>
  </body>

</html>