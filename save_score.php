<?php
require_once("config.php");
header('Content-Type: application/json');

try {
    $connect = mysqli_connect(HOST, USER, PASS, DB);
    
    if(mysqli_connect_errno()){
        echo json_encode([
            'success' => false,
            'error' => 'Errore connessione: '.mysqli_connect_error()
        ]);
        exit;
    }
    
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $input = json_decode(file_get_contents('php://input'), true);
        
        $user = mysqli_real_escape_string($connect, trim($input['username']));
        $punteggio = (int)$input['punteggio'];
        $gems = (int)$input['gems'];
        
        $insert = "INSERT INTO Scoreboard(Username, Score, Gems) VALUES (?, ?, ?)";
        $statement = mysqli_prepare($connect, $insert);
        
        if(!$statement){
            echo json_encode([
                'success' => false,
                'error' => 'Errore query'
            ]);
            exit;
        }
        
        mysqli_stmt_bind_param($statement, "sii", $user, $punteggio, $gems);
        
        if(mysqli_stmt_execute($statement)){
            echo json_encode([
                'success' => true,
                'message' => 'Punteggio salvato',
                'username' => $user,
                'punteggio' => $punteggio,
                'gems' => $gems
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Errore nell\'inserimento'
            ]);
        }
        
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