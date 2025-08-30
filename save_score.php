<?php
require_once("config.php");
header('Content-Type: application/json');

try {
    $connect = mysqli_connect(HOST, USER, PASS, DB);
    
    // Errore di connessione
    if(mysqli_connect_errno()){
        echo json_encode([
            'success' => false,
            'error' => 'Errore connessione: ' . mysqli_connect_error()
        ]);
        exit;
    }
    
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        // IMPORTANTE: Leggi i dati POST
        $input = json_decode(file_get_contents('php://input'), true);
        
        if(!$input || !isset($input['username']) || !isset($input['punteggio']) || !isset($input['gems'])){
            echo json_encode([
                'success' => false,
                'error' => 'Dati mancanti'
            ]);
            exit;
        }
        
        // Usa mysqli_real_escape_string CORRETTAMENTE
        $user = mysqli_real_escape_string($connect, trim($input['username']));
        $punteggio = (int)$input['punteggio'];
        $gems = (int)$input['gems'];
        
        // Validazione username
        if(empty($user)) {
            $user = "???";
        }
        
        $insert = "INSERT INTO Scoreboard(Username, Score, Gems) VALUES (?, ?, ?)";
        $statement = mysqli_prepare($connect, $insert);
        
        if(!$statement) {
            echo json_encode([
                'success' => false,
                'error' => 'Errore preparazione query'
            ]);
            exit;
        }
        
        mysqli_stmt_bind_param($statement, "sii", $user, $punteggio, $gems);
        
        if(mysqli_stmt_execute($statement)) {
            echo json_encode([
                'success' => true,
                'message' => 'Punteggio salvato con successo',
                'username' => $user,
                'punteggio' => $punteggio,
                'gems' => $gems
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Errore nell\'inserimento: ' . mysqli_error($connect)
            ]);
        }
        
        mysqli_stmt_close($statement);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Metodo non consentito'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Errore server: ' . $e->getMessage()
    ]);
} finally {
    if(isset($connect)) {
        mysqli_close($connect);
    }
}

/*
$del = "DELETE FROM Scoreboard 
            WHERE id NOT IN (
                SELECT id FROM (
                    SELECT id 
                    FROM Scoreboard 
                    ORDER BY punteggio DESC, gems DESC 
                    LIMIT 50
                ) as top50
            )";
            */

//errore di connessione