SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
CREATE DATABASE IF NOT EXISTS `your_email_database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `your_email_database`;

CREATE TABLE `EmailSchedule` (
  `Id` int(10) UNSIGNED NOT NULL,
  `Sent` tinyint(1) NOT NULL,
  `ScheduledDateTime` datetime NOT NULL,
  `ToEmailAddress` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `SentDateTime` datetime DEFAULT NULL,
  `CreatedDateTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  
ALTER TABLE `EmailSchedule`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `SentAndScheduledDateTime` (`Sent`,`ScheduledDateTime`) USING BTREE;


ALTER TABLE `EmailSchedule`
  MODIFY `Id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
