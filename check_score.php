<?php
require_once("config.php");

header('Content-Type: application/json');

try {
    $connect = mysqli_connect(HOST, USER, PASS, DB);

    //errore di connessione
    if(mysqli_connect_errno()){
        echo json_encode([
            'success' => false,
            'error' => 'Errore connessione: '.mysqli_connect_error()
        ]);
        exit;
    }

    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $input = json_decode(file_get_contents('php://input'), true);

        $punteggio = (int)$input['punteggio'];
        $gems = (int)$input['gems'];

        $query = "SELECT COUNT(*) as count FROM Scoreboard 
                  WHERE Score > ? 
                  OR (Score = ? AND Gems > ?)";
        
        $statement = mysqli_prepare($connect, $query);
        
        if(!$statement){
            echo json_encode([
                'success' => false,
                'error' => 'Errore query'
            ]);
            exit;
        }
        
        mysqli_stmt_bind_param($statement, "iii", $punteggio, $punteggio, $gems);
        mysqli_stmt_execute($statement);

        $result = mysqli_stmt_get_result($statement);
        $row = mysqli_fetch_assoc($result);

        $posizione = $row['count'] + 1;
        $in_classifica = ($posizione <= 50);

        echo json_encode([
            'success' => true,
            'in_classifica' => $in_classifica,
            'posizione' => $posizione,
            'punteggio' => $punteggio,
            'gems' => $gems
        ]);
        
        mysqli_stmt_close($statement);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Errore server: '.$e->getMessage()
    ]);
} finally {
    mysqli_close($connect);
}