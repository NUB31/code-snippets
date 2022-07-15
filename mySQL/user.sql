CREATE DATABASE IF NOT EXISTS `ExampleDatabase`;
USE `ExampleDatabase`;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(1024) NOT NULL,
  `email` varchar(255) NOT NULL,
  `picture` varchar(1024) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;

REPLACE INTO `user` (`id`, `username`, `password`, `email`) VALUES
	(1, 'john doe', '$2b$10$ZkBNtHwF4Dja/YswAsgakut0YdvC7nLWsGJ7xuTTp4cX11Hi38qOm', 'john.doe@example.com');
