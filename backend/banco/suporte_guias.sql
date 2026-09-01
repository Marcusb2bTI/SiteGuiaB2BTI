-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 28/08/2026 às 19:40
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `suporte_guias`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `assuntos`
--

CREATE TABLE `assuntos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `icone` varchar(255) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `ordem` int(11) DEFAULT 0,
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `assuntos`
--

INSERT INTO `assuntos` (`id`, `titulo`, `descricao`, `slug`, `icone`, `video_url`, `ordem`, `ativo`, `created_at`, `updated_at`) VALUES
(3, 'Impressora', 'Problemas com impressora não imprimindo, travamentos ou erros de conexão', 'impressora', '🖨️', NULL, 1, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55'),
(4, 'NFC-e', 'Dificuldades com emissão de nota fiscal eletrônica ao consumidor', 'nfce', '📄', NULL, 2, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55'),
(5, 'Caixa', 'Problemas no sistema de caixa ou PDV', 'caixa', '💰', NULL, 3, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55'),
(6, 'Smart TEF', 'Erros na integração com máquina de cartão ou pagamentos', 'tef', '💳', NULL, 4, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55'),
(7, 'Pallas Bolso', 'Problemas no aplicativo mobile Pallas Bolso', 'pallasbolso', '📱', NULL, 5, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55'),
(8, 'Cardápio Digital', 'Configuração e problemas com o cardápio digital', 'cardapio', '🍽️', NULL, 6, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55'),
(9, 'Licença', 'Caso o sistema esteja pedindo uma tela de Licença', 'licenca', '🎫', NULL, 7, 1, '2026-08-28 17:01:55', '2026-08-28 17:01:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `passos`
--

CREATE TABLE `passos` (
  `id` int(11) NOT NULL,
  `assunto_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `passo_imagens`
--

CREATE TABLE `passo_imagens` (
  `id` int(11) NOT NULL,
  `passo_id` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `assuntos`
--
ALTER TABLE `assuntos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices de tabela `passos`
--
ALTER TABLE `passos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assunto_id` (`assunto_id`);

--
-- Índices de tabela `passo_imagens`
--
ALTER TABLE `passo_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `passo_id` (`passo_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `assuntos`
--
ALTER TABLE `assuntos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `passos`
--
ALTER TABLE `passos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `passo_imagens`
--
ALTER TABLE `passo_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `passos`
--
ALTER TABLE `passos`
  ADD CONSTRAINT `passos_ibfk_1` FOREIGN KEY (`assunto_id`) REFERENCES `assuntos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `passo_imagens`
--
ALTER TABLE `passo_imagens`
  ADD CONSTRAINT `passo_imagens_ibfk_1` FOREIGN KEY (`passo_id`) REFERENCES `passos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
