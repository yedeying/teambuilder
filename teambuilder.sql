-- phpMyAdmin SQL Dump
-- version 4.0.9
-- http://www.phpmyadmin.net
--
-- 主机: 127.0.0.1
-- 生成日期: 2014-11-17 15:52:03
-- 服务器版本: 5.6.14
-- PHP 版本: 5.5.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `teambuilder`
--
CREATE DATABASE IF NOT EXISTS `teambuilder` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `teambuilder`;

-- --------------------------------------------------------

--
-- 表的结构 `tmpuser`
--
-- 创建时间: 2014-11-07 11:41:16
--

CREATE TABLE IF NOT EXISTS `tmpuser` (
  `uid` bigint(18) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createtime` varchar(100) NOT NULL,
  `tid` varchar(100) NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='用户' AUTO_INCREMENT=4 ;

--
-- 转存表中的数据 `tmpuser`
--

INSERT INTO `tmpuser` (`uid`, `email`, `username`, `password`, `timestamp`, `createtime`, `tid`) VALUES
(3, 'kanwode918@qq.com', 'yedeying999', '2657fc21b3db58edce87309baae1646427fc7004', '2014-11-17 14:13:02', '1416233582739', '0809fd52d2f2e4a8b9c63590e86d7c216017b995');

-- --------------------------------------------------------

--
-- 表的结构 `user`
--
-- 创建时间: 2014-11-07 08:48:53
--

CREATE TABLE IF NOT EXISTS `user` (
  `uid` bigint(18) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `update` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `contact` varchar(100) NOT NULL,
  `gender` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
