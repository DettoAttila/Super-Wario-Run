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
    
    // Query per ottenere la top 50 (o cambia il numero come preferisci)
    $query = "SELECT * 
              FROM Scoreboard 
              ORDER BY Score DESC, Gems DESC 
              LIMIT 50";
    
    $result = mysqli_query($connect, $query);
    
    if(!$result) {
        echo json_encode([
            'success' => false,
            'error' => 'Errore nella query: ' . mysqli_error($connect)
        ]);
        exit;
    }
    
    $classifica = [];
    $posizione = 1;
    
    while($row = mysqli_fetch_assoc($result)) {
        $classifica[] = [
            'posizione' => $posizione,
            'username' => htmlspecialchars($row['Username']), // Sicurezza contro XSS
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