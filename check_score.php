<?php
require_once("config.php");

header('Content-Type: application/json');

try {
    $connect = mysqli_connect(HOST, USER, PASS, DB);

    //errore di connessione
    if(mysqli_connect_errno()) {
        echo json_encode([
            'success' => false,
            'error' => 'Errore connessione database: ' . mysqli_connect_error()
        ]);
        exit;
    }

    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $input = json_decode(file_get_contents('php://input'), true);

        if(!$input || !isset($input['punteggio']) || !isset($input['gems'])){
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Dati mancanti o JSON non valido'
            ]);
            exit;
        }

        $punteggio = (int)$input['punteggio'];
        $gems = (int)$input['gems'];

        $query = "SELECT COUNT(*) as count FROM Scoreboard 
                  WHERE Score > ? 
                  OR (Score = ? AND Gems > ?)";
        
        $statement = mysqli_prepare($connect, $query);
        
        if (!$statement) {
            echo json_encode([
                'success' => false,
                'error' => 'Errore preparazione query'
            ]);
            exit;
        }
        
        mysqli_stmt_bind_param($statement, "iii", $punteggio, $punteggio, $gems);
        mysqli_stmt_execute($statement);

        $result = mysqli_stmt_get_result($statement);
        $row = mysqli_fetch_assoc($result);

        $posizione = $row['count'] + 1;
        $inClassifica = ($posizione <= 50); // o <= 50, come preferisci

        // Restituisci un oggetto JSON completo
        echo json_encode([
            'success' => true,
            'inClassifica' => $inClassifica,
            'posizione' => $posizione,
            'punteggio' => $punteggio,
            'gems' => $gems
        ]);
        
        mysqli_stmt_close($statement);
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Metodo non consentito'
        ]);
    }

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Errore server: ' . $e->getMessage()
    ]);
} finally {
    if (isset($connect)) {
        mysqli_close($connect);
    }
}