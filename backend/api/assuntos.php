<?php
// api/assuntos.php
// GET -> lista todos os assuntos ativos (para montar os cards na tela inicial)

header("Access-Control-Allow-Origin: *"); // em produção, troque * pelo domínio do seu front
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/../config/database.php';

$stmt = $pdo->query(
    "SELECT id, titulo, descricao, slug, icone, ordem
     FROM assuntos
     WHERE ativo = true
     ORDER BY ordem ASC"
);

$assuntos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($assuntos, JSON_UNESCAPED_UNICODE);