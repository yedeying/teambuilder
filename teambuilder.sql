-- phpMyAdmin SQL Dump
-- version 4.0.9
-- http://www.phpmyadmin.net
--
-- 主机: 127.0.0.1
-- 生成日期: 2014-11-21 01:31:59
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

-- --------------------------------------------------------

--
-- 表的结构 `class`
--

CREATE TABLE IF NOT EXISTS `class` (
  `cid` bigint(20) NOT NULL AUTO_INCREMENT,
  `teacher` bigint(20) NOT NULL,
  `grade` varchar(100) NOT NULL,
  `major` varchar(100) NOT NULL,
  `class` varchar(100) NOT NULL,
  PRIMARY KEY (`cid`),
  UNIQUE KEY `cid` (`cid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `class`
--

INSERT INTO `class` (`cid`, `teacher`, `grade`, `major`, `class`) VALUES
(1, 12, '12级', '软件工程', '2班');

-- --------------------------------------------------------

--
-- 表的结构 `comment`
--

CREATE TABLE IF NOT EXISTS `comment` (
  `cid` bigint(20) NOT NULL AUTO_INCREMENT,
  `id` bigint(20) NOT NULL,
  `uid` bigint(20) NOT NULL,
  `type` int(11) NOT NULL,
  `deep` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `content` text NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `comment`
--

INSERT INTO `comment` (`cid`, `id`, `uid`, `type`, `deep`, `time`, `content`) VALUES
(1, 1, 13, 0, 0, '2014-11-20 23:20:19', 'i''m just a message');

-- --------------------------------------------------------

--
-- 表的结构 `file`
--

CREATE TABLE IF NOT EXISTS `file` (
  `fid` bigint(20) NOT NULL AUTO_INCREMENT,
  `id` bigint(20) NOT NULL,
  `uploader` bigint(20) NOT NULL,
  `type` int(11) NOT NULL,
  `filename` varchar(1024) NOT NULL,
  `fsha1` varchar(40) NOT NULL,
  `uploadtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `file`
--

INSERT INTO `file` (`fid`, `id`, `uploader`, `type`, `filename`, `fsha1`, `uploadtime`) VALUES
(1, 1, 13, 0, 'my.css', 'fdgfsdfsaf1df6sadf4dsa56fa', '2014-11-20 23:06:22');

-- --------------------------------------------------------

--
-- 表的结构 `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
  `gid` bigint(20) NOT NULL AUTO_INCREMENT,
  `cid` bigint(20) NOT NULL,
  `admin` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `memberlist` text NOT NULL,
  PRIMARY KEY (`gid`),
  UNIQUE KEY `gid` (`gid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `groups`
--

INSERT INTO `groups` (`gid`, `cid`, `admin`, `name`, `memberlist`) VALUES
(1, 1, 13, 'teambuilder小组', '[11,13]');

-- --------------------------------------------------------

--
-- 表的结构 `project`
--

CREATE TABLE IF NOT EXISTS `project` (
  `pid` bigint(20) NOT NULL AUTO_INCREMENT,
  `gid` bigint(20) NOT NULL,
  `creater` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `createtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expecttime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `finishtime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` int(11) NOT NULL,
  PRIMARY KEY (`pid`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- 转存表中的数据 `project`
--

INSERT INTO `project` (`pid`, `gid`, `creater`, `name`, `description`, `createtime`, `expecttime`, `finishtime`, `status`) VALUES
(1, 1, 13, 'teambuilder', '这是teambuilder项目，属于岗位实践课程', '2014-11-20 18:56:52', '2014-11-30 01:17:30', '0000-00-00 00:00:00', 0),
(2, 1, 13, '第二个Project', '第二个Project', '2014-11-20 20:54:18', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0);

-- --------------------------------------------------------

--
-- 表的结构 `task`
--

CREATE TABLE IF NOT EXISTS `task` (
  `tid` bigint(20) NOT NULL AUTO_INCREMENT,
  `pid` bigint(20) NOT NULL,
  `creater` bigint(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `status` int(11) NOT NULL,
  `createtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expecttime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `finishtime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `participant` text NOT NULL,
  PRIMARY KEY (`tid`),
  UNIQUE KEY `tid` (`tid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- 转存表中的数据 `task`
--

INSERT INTO `task` (`tid`, `pid`, `creater`, `title`, `content`, `status`, `createtime`, `expecttime`, `finishtime`, `participant`) VALUES
(1, 1, 13, '这是第一个任务', 'test', 0, '2014-11-20 19:00:29', '2014-11-29 21:30:24', '0000-00-00 00:00:00', '[11]'),
(2, 1, 13, '第二个任务', '第二个任务', 0, '2014-11-20 20:53:24', '0000-00-00 00:00:00', '0000-00-00 00:00:00', ''),
(3, 2, 13, '第三个任务', '第三个任务', 0, '2014-11-20 20:53:50', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '');

-- --------------------------------------------------------

--
-- 表的结构 `tmpuser`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `update`
--

CREATE TABLE IF NOT EXISTS `update` (
  `did` bigint(20) NOT NULL AUTO_INCREMENT,
  `tid` bigint(20) NOT NULL,
  `uid` bigint(20) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `description` text NOT NULL,
  PRIMARY KEY (`did`),
  UNIQUE KEY `did` (`did`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `uid` bigint(18) NOT NULL AUTO_INCREMENT,
  `cid` bigint(20) NOT NULL,
  `gid` bigint(20) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `createtime` varchar(100) NOT NULL,
  `contact` varchar(100) NOT NULL,
  `gender` varchar(100) NOT NULL,
  `accessibility` int(11) NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`uid`, `cid`, `gid`, `username`, `email`, `password`, `createtime`, `contact`, `gender`, `accessibility`) VALUES
(10, 0, 0, 'liyawen', '413235793@qq.com', 'a95a42d0088fc0d240262959270c5e5cd465226b', '1416312146586', '', '未知', 0),
(11, 1, 0, 'Aron', '273305282@qq.com', '22acfa0ed5e62263fe522b06876d9f78fe9c0479', '1416326684633', '', '未知', 0),
(12, 1, 0, 'yedeying', '945173727@qq.com', '738ef8264fd22bd7ca197c7bb6cfdb8b1ceb4904', '1416377473896', '13760284409', '男', 2),
(13, 1, 1, '叶德颖', 'kanwode918@qq.com', '0fc213126df2decaff2a169ca50ede8e04682c03', '1416498219505', '13760284409', '男', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
