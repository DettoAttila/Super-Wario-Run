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
    
    //QUERY TOP 50
    $query = "SELECT * 
              FROM Scoreboard 
              ORDER BY Score DESC, Gems DESC
              LIMIT 50";
    
    $result = mysqli_query($connect, $query);
    
    if(!$result) {
        echo json_encode([
            'success' => false,
            'error' => 'Errore query'
        ]);
        exit;
    }
    
    $classifica = [];
    $posizione = 1;
    
    while($row = mysqli_fetch_assoc($result)) {
        $classifica[] = [
            'posizione' => $posizione,
            'username' => htmlspecialchars($row['Username']),
            'score' => (int)$row['Score'],
            'gems' => (int)$row['Gems']
        ];

        $posizione++;
    }
    
    echo json_encode([
        'success' => true,
        'classifica' => $classifica,
        'total' => count($classifica)
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Errore server: '.$e->getMessage()
    ]);
} finally {
    mysqli_close($connect);
}