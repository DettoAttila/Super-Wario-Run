-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Creato il: Set 04, 2025 alle 17:42
-- Versione del server: 8.0.43-0ubuntu0.24.04.1
-- Versione PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Attadia_665349`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `Scoreboard`
--

CREATE TABLE `Scoreboard` (
  `ID` int NOT NULL,
  `Username` varchar(15) NOT NULL,
  `Score` int NOT NULL,
  `Gems` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Scoreboard per salvare i punteggi.';

--
-- Dump dei dati per la tabella `Scoreboard`
--

INSERT INTO `Scoreboard` (`ID`, `Username`, `Score`, `Gems`) VALUES
(6, 'x', 376, 10),
(7, 'Roxanne', 119, 0),
(8, 'Eleanor Rigby', 223, 6),
(9, '???', 173, 2),
(10, 'MSC', 4009, 149),
(11, 'Attilio', 4277, 137),
(104, 'Birdo', 148, 1),
(105, 'Peach', 846, 24),
(106, 'Lino', 185, 4),
(107, 'Pino', 4072, 127),
(108, 'Gino', 1050, 33),
(109, 'Rino', 8528, 287),
(111, 'Lol', 5380, 179),
(112, 'Daisy', 1201, 40),
(113, 'Lady Starlight', 4653, 141),
(114, 'Yoshi', 2989, 96),
(115, 'Bug', 5095, 158),
(116, 'ghjegghj', 2041, 61),
(117, 'Prova', 1048, 29),
(118, 'Siono', 2421, 73),
(119, 'Wario', 3785, 125),
(120, 'Ok', 2265, 68),
(121, 'Test', 5958, 194),
(122, 'ABC', 1187, 33),
(123, 'Waluigi', 1611, 44),
(124, 'Peach', 1754, 49),
(125, '???', 1190, 32),
(127, 'Attila', 12386, 426),
(128, 'Rosalinda', 1837, 55),
(129, 'Brian', 2461, 80),
(130, 'Dave', 3595, 112),
(131, 'James', 3152, 101),
(133, 'New High Score', 3302, 104),
(134, 'DEV', 12002, 421),
(135, 'Janick', 5114, 166),
(136, 'Attila (ancora)', 13251, 476),
(137, 'Gaga', 3897, 157),
(138, 'Zagor', 2261, 9),
(139, 'Dave', 4287, 184),
(140, '???', 2328, 89),
(141, 'Steve', 4062, 181),
(148, 'Tex', 4134, 169),
(149, 'Xabaras', 2654, 106),
(150, 'Criss', 2833, 84),
(152, '111', 4204, 152),
(154, 'Attila (again)', 13164, 545),
(155, '???', 6309, 205),
(156, '???', 9607, 450),
(157, 'Pippo', 7943, 342),
(159, '???????', 4909, 200),
(165, 'Niente?', 5235, 167),
(166, 'VicRattlehead', 14348, 618),
(167, 'Java', 4164, 171),
(168, 'Ok', 5384, 184),
(169, 'Ok', 4773, 216),
(170, '???', 4095, 113),
(171, 'Ok', 7519, 284),
(172, 'Diabolik', 8007, 349),
(173, 'Test', 6334, 280),
(174, 'EddieTheHead', 15323, 704),
(175, 'Dylan Dog', 10310, 470),
(176, 'Eh?', 8247, 385),
(177, 'Mario', 4726, 236),
(178, 'Mickey', 4476, 196),
(179, 'Quasi', 6623, 284),
(180, 'Fine', 9069, 426),
(181, 'Martin Mystère', 11596, 533),
(182, '???', 6065, 251),
(183, 'Mario', 7900, 347),
(184, '???', 5163, 219),
(185, '???', 5270, 262),
(186, 'ATTILA', 19614, 985),
(187, 'a', 7073, 359),
(188, 'Luigi', 8194, 376),
(189, '???', 5535, 263),
(190, 'PIPPO', 5836, 292),
(191, 'TEST4444', 7582, 350),
(192, '111111111111111', 4532, 226),
(193, 'lllllll', 6212, 305),
(194, 'No', 5494, 267),
(195, 'Player', 15786, 709),

-- Nota: da qui iniziano i punteggi realizzati da altre persone dopo aver hostato il gioco su un server.
-- Alcuni nomi sono stati modificati per decenza.
(196, 'Pigna', 5122, 155),
(197, 'jini', 6769, 260),
(198, 'lollolacustre', 5961, 249),
(199, 'juib', 5636, 233),
(200, 'hjk', 7737, 273),
(201, 'jini', 7181, 268),
(202, 'lollolacustre', 5118, 177),
(203, 'Neitor', 11215, 535),
(204, 'Turbo', 12113, 556),
(205, 'Omega', 12593, 547),
(206, 'Pigna', 7305, 294),
(207, 'Pigna', 7657, 274),
(208, 'Brandiamond', 12073, 559),
(209, 'ciaocharly', 5528, 195),
(210, 'jophn martiri', 9066, 317),
(211, 'jogn maritir', 12857, 462),
(212, 'Daje Roma', 12688, 529),
(213, 'alemike', 7758, 281),
(214, '???', 6648, 262),
(215, '???', 6166, 226),
(216, '???', 7351, 302),
(217, 'alemike', 13291, 515),
(218, '???', 9269, 388),
(219, '???', 7355, 257),
(220, '???', 6811, 252),
(221, '???', 9889, 376),
(222, 'alemike', 16288, 691),
(223, 'Brandinho', 15283, 615),
(224, 'Vesperial', 6375, 416),
(225, 'Pigna', 6965, 201),
(226, 'lollolacustre', 8007, 287),
(227, 'lollolacustre', 14424, 547),
(228, 'rick astley', 8856, 375),
(229, 'i  am steve', 8883, 323),
(230, 'luca', 7377, 299),
(231, 'CatboyEndemion', 12420, 540),
(232, 'CatboyEndemion', 14453, 655),
(233, 'CatboyEndemion', 18291, 874),
(234, 'Pigna', 10657, 387),
(235, '<span>???</span', 7420, 369),
(236, '???', 7420, 369),
(237, '???', 7420, 0),
(238, '???', 7420, 370),
(239, '???', 7420, 370),
(240, 'CatboyEndemion', 19545, 1005),
(241, 'CatboyEndemion', 19965, 1014),
(242, '???', 7423, 382),
(243, '???', 8036, 390),
(244, 'E', 8767, 344),
(245, 'Scooby Doo', 17967, 804),
(246, 'B.P.', 16907, 711),
(247, '???', 11253, 397),
(248, '???', 14484, 502),
(249, '???', 15336, 710),
(250, '???', 14579, 570),
(251, '???', 9734, 332),
(252, '???', 12847, 610),
(253, '???', 11143, 486),
(254, '???', 13670, 557),
(255, '???', 13380, 522),
(256, '???', 9645, 381),
(257, '???', 9622, 377),
(258, '???', 13491, 504),
(259, '???', 10366, 423),
(260, '???', 9334, 391),
(261, '???', 9733, 418),
(262, '???', 11898, 432),
(263, '???', 9707, 347),
(264, '???', 14116, 602),
(265, '???', 9807, 426),
(266, '???', 10929, 455),
(267, '???', 12094, 522),
(268, 'Rizz', 21680, 958),
(269, 'Megatron', 24373, 1038),
(270, '911', 21052, 831),
(271, 'George', 20906, 824),
(272, 'LeBron', 27084, 1096),
(273, '???', 13073, 506),
(274, 'No?', 37420, 1501),
(275, '???', 14221, 521),
(276, '???', 14345, 597),
(277, '???', 21604, 866),
(278, 'Pasta', 41151, 1757),
(279, '???', 22161, 874),
(280, '???', 14527, 588),
(281, 'Chiara', 13735, 591),
(282, '???', 12318, 503),
(283, 'Chiara', 12764, 578),
(284, 'Chiara', 19174, 818);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `Scoreboard`
--
ALTER TABLE `Scoreboard`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `Username` (`Username`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `Scoreboard`
--
ALTER TABLE `Scoreboard`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
