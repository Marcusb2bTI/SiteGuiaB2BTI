<?php
// api/cadastrar_tutorial.php
// POST -> cria um novo assunto (card) junto com seus passos e imagens.
//
// Espera receber via multipart/form-data:
//   titulo       (string, obrigatório)
//   descricao    (string, opcional)
//   video_url    (string, opcional)
//   passos       (string JSON, obrigatório) -> ex:
//       [{"titulo":"Passo 1","descricao":"..."}, {"titulo":"Passo 2","descricao":"..."}]
//   imagem_0, imagem_1, imagem_2... (arquivos) -> uma imagem por passo,
//       o número no nome do campo tem que bater com o índice do passo no array acima

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/../config/database.php';

function slugify(string $texto): string
{
    $texto = mb_strtolower($texto, 'UTF-8');
    $trocas = [
        '/[áàâãä]/u' => 'a', '/[éèêë]/u' => 'e', '/[íìîï]/u' => 'i',
        '/[óòôõö]/u' => 'o', '/[úùûü]/u' => 'u', '/[ç]/u' => 'c',
    ];
    $texto = preg_replace(array_keys($trocas), array_values($trocas), $texto);
    $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
    return trim($texto, '-');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido, use POST"]);
    exit;
}

$titulo     = trim($_POST['titulo'] ?? '');
$descricao  = trim($_POST['descricao'] ?? '');
$video_url  = trim($_POST['video_url'] ?? '');
$icone      = trim($_POST['icone'] ?? '');
$passosJson = $_POST['passos'] ?? null;

if (!$titulo || !$passosJson) {
    http_response_code(400);
    echo json_encode(["erro" => "Título e passos são obrigatórios"]);
    exit;
}

$passos = json_decode($passosJson, true);
if (!is_array($passos) || count($passos) === 0) {
    http_response_code(400);
    echo json_encode(["erro" => "Passos inválidos, envie um JSON válido com pelo menos 1 passo"]);
    exit;
}

$slug = slugify($titulo);

// Garante slug único (se já existir, adiciona um sufixo numérico)
$stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM assuntos WHERE slug = :slug");
$slugBase = $slug;
$contador = 1;
while (true) {
    $stmtCheck->execute(['slug' => $slug]);
    if ($stmtCheck->fetchColumn() == 0) break;
    $slug = $slugBase . '-' . (++$contador);
}

// Pasta onde as imagens desse assunto vão ficar: backend/uploads/{slug}/
$pastaUpload = __DIR__ . '/../uploads/' . $slug;
if (!is_dir($pastaUpload)) {
    mkdir($pastaUpload, 0777, true);
}

try {
    $pdo->beginTransaction();

    // Calcula a próxima ordem (pega o maior valor atual + 1)
    $novaOrdem = (int) $pdo->query("SELECT COALESCE(MAX(ordem), 0) + 1 FROM assuntos")->fetchColumn();

    // 1) Cria o assunto
    $stmt = $pdo->prepare(
        "INSERT INTO assuntos (titulo, descricao, slug, icone, video_url, ordem)
         VALUES (:titulo, :descricao, :slug, :icone, :video_url, :ordem)"
    );
    $stmt->execute([
        'titulo'    => $titulo,
        'descricao' => $descricao,
        'slug'      => $slug,
        'icone'     => $icone ?: null,
        'video_url' => $video_url ?: null,
        'ordem'     => $novaOrdem,
    ]);
    $assuntoId = $pdo->lastInsertId();

    // 2) Cria cada passo + sua imagem (se enviada)
    $stmtPasso = $pdo->prepare(
        "INSERT INTO passos (assunto_id, titulo, descricao, ordem) VALUES (:assunto_id, :titulo, :descricao, :ordem)"
    );
    $stmtImg = $pdo->prepare(
        "INSERT INTO passo_imagens (passo_id, url, ordem) VALUES (:passo_id, :url, 0)"
    );

    foreach ($passos as $index => $passo) {
        $stmtPasso->execute([
            'assunto_id' => $assuntoId,
            'titulo'     => $passo['titulo'] ?? '',
            'descricao'  => $passo['descricao'] ?? '',
            'ordem'      => $index,
        ]);
        $passoId = $pdo->lastInsertId();

        $campoArquivo = "imagem_$index";
        if (isset($_FILES[$campoArquivo]) && $_FILES[$campoArquivo]['error'] === UPLOAD_ERR_OK) {
            $extensao = strtolower(pathinfo($_FILES[$campoArquivo]['name'], PATHINFO_EXTENSION));
            $nomeArquivo = 'passo' . ($index + 1) . '.' . $extensao;
            $caminhoDestino = $pastaUpload . '/' . $nomeArquivo;

            move_uploaded_file($_FILES[$campoArquivo]['tmp_name'], $caminhoDestino);

            // URL relativa, servida pelo próprio servidor PHP (ex: uploads/caixa/passo1.png)
            $urlPublica = 'uploads/' . $slug . '/' . $nomeArquivo;

            $stmtImg->execute([
                'passo_id' => $passoId,
                'url'      => $urlPublica,
            ]);
        }
    }

    $pdo->commit();

    echo json_encode([
        "sucesso" => true,
        "id"      => $assuntoId,
        "slug"    => $slug,
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["erro" => "Falha ao cadastrar: " . $e->getMessage()]);
}