<?php
// api/guia.php?slug=caixa
// GET -> retorna o assunto + fullGuide (passos com imagens) + quickGuide (só títulos)
// Mesmo formato que o front já usa hoje com os arquivos estáticos.

header("Access-Control-Allow-Origin: *"); // em produção, troque * pelo domínio do seu front
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/../config/database.php';

$slug = $_GET['slug'] ?? null;

if (!$slug) {
    http_response_code(400);
    echo json_encode(["erro" => "Parâmetro 'slug' é obrigatório"]);
    exit;
}

// Busca o assunto
$stmt = $pdo->prepare(
    "SELECT id, titulo, descricao, slug, video_url
     FROM assuntos
     WHERE slug = :slug AND ativo = true"
);
$stmt->execute(['slug' => $slug]);
$assunto = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$assunto) {
    http_response_code(404);
    echo json_encode(["erro" => "Assunto não encontrado"]);
    exit;
}

// Busca os passos do assunto, em ordem
$stmtPassos = $pdo->prepare(
    "SELECT id, titulo, descricao, ordem
     FROM passos
     WHERE assunto_id = :id
     ORDER BY ordem ASC"
);
$stmtPassos->execute(['id' => $assunto['id']]);
$passos = $stmtPassos->fetchAll(PDO::FETCH_ASSOC);

// Busca as imagens de cada passo
$stmtImg = $pdo->prepare(
    "SELECT url FROM passo_imagens WHERE passo_id = :passo_id ORDER BY ordem ASC"
);

foreach ($passos as &$passo) {
    $stmtImg->execute(['passo_id' => $passo['id']]);
    $passo['imagens'] = $stmtImg->fetchAll(PDO::FETCH_COLUMN);
    unset($passo['id']); // remove se não quiser expor o id no front
}
unset($passo);

$resposta = [
    "assunto"    => $assunto,
    "fullGuide"  => $passos,
    "quickGuide" => array_column($passos, 'titulo'),
];

echo json_encode($resposta, JSON_UNESCAPED_UNICODE);