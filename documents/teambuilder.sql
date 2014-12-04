-- phpMyAdmin SQL Dump
-- version 4.0.9
-- http://www.phpmyadmin.net
--
-- 主机: 127.0.0.1
-- 生成日期: 2014-12-04 09:50:37
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
  `grade` varchar(100) NOT NULL,
  `major` varchar(100) NOT NULL,
  `class` varchar(100) NOT NULL,
  PRIMARY KEY (`cid`),
  UNIQUE KEY `cid` (`cid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=40 ;

--
-- 转存表中的数据 `class`
--

INSERT INTO `class` (`cid`, `grade`, `major`, `class`) VALUES
(1, '12级', '软件工程', '2班'),
(2, '11级', '软件工程', '1班'),
(3, '11级', '软件工程', '2班'),
(4, '11级', '软件工程', '3班'),
(5, '11级', '计算机科学与技术', '3班'),
(6, '11级', '计算机科学与技术', '2班'),
(7, '11级', '计算机科学与技术', '1班'),
(8, '12级', '计算机科学与技术', '1班'),
(9, '12级', '计算机科学与技术', '2班'),
(10, '12级', '计算机科学与技术', '3班'),
(11, '12级', '软件工程', '1班'),
(12, '12级', '软件工程', '3班'),
(13, '12级', '软件工程', '4班'),
(14, '11级', '网络工程', '1班'),
(15, '11级', '网络工程', '2班'),
(16, '12级', '网络工程', '1班'),
(17, '12级', '网络工程', '2班'),
(25, '13级', '计算机与软件学院', '1班'),
(26, '13级', '计算机与软件学院', '2班'),
(27, '13级', '计算机与软件学院', '3班'),
(28, '13级', '计算机与软件学院', '4班'),
(29, '13级', '计算机与软件学院', '5班'),
(30, '13级', '计算机与软件学院', '6班'),
(31, '13级', '计算机与软件学院', '7班'),
(32, '13级', '计算机与软件学院', '8班'),
(33, '13级', '计算机与软件学院', '9班'),
(34, '14级', '计算机与软件学院', '1班'),
(35, '14级', '计算机与软件学院', '2班'),
(36, '14级', '计算机与软件学院', '3班'),
(37, '14级', '计算机与软件学院', '4班'),
(38, '14级', '计算机与软件学院', '5班'),
(39, '14级', '计算机与软件学院', '6班');

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
-- 表的结构 `detail`
--

CREATE TABLE IF NOT EXISTS `detail` (
  `did` bigint(20) NOT NULL AUTO_INCREMENT,
  `tid` bigint(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `createtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`did`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- 转存表中的数据 `detail`
--

INSERT INTO `detail` (`did`, `tid`, `title`, `content`, `createtime`) VALUES
(1, 1, '我是子任务', '我是子任务的内容', '2014-12-01 09:24:10'),
(2, 2, '我是子任务2', '我是子任务2的内容', '2014-12-01 09:24:10');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- 转存表中的数据 `groups`
--

INSERT INTO `groups` (`gid`, `cid`, `admin`, `name`, `memberlist`) VALUES
(1, 1, 13, 'teambuilder小组', '[11,13]'),
(2, 0, 14, 'yedeying', '');

-- --------------------------------------------------------

--
-- 表的结构 `invite`
--

CREATE TABLE IF NOT EXISTS `invite` (
  `iid` bigint(20) NOT NULL,
  `user` varchar(100) NOT NULL,
  `admin` varchar(100) NOT NULL,
  `sha1code` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `invite`
--

INSERT INTO `invite` (`iid`, `user`, `admin`, `sha1code`) VALUES
(0, '945173727@qq.com', 'kanwode918@qq.com', '84d743a860e95e5f94cad2346bba4608427961a0');

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
  `status` int(11) NOT NULL,
  PRIMARY KEY (`pid`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=17 ;

--
-- 转存表中的数据 `project`
--

INSERT INTO `project` (`pid`, `gid`, `creater`, `name`, `description`, `createtime`, `status`) VALUES
(1, 1, 13, 'teambuilder', '这是teambuilder项目，属于岗位实践课程', '2014-11-20 18:56:52', 0),
(2, 1, 13, '第二个Project', '第二个Projectchange', '2014-11-20 20:54:18', 0),
(13, 1, 13, 'test', 'test', '2014-11-23 09:02:52', 0),
(14, 1, 13, '啦啦啦第四个项目', '啦啦啦第四个项目', '2014-12-01 07:40:26', 0),
(15, 1, 13, '啦啦啦第五个项目', '啦啦啦第四个项目', '2014-12-01 07:41:33', 0),
(16, 2, 14, 'aaa', 'aaa', '2014-12-03 02:48:13', 0);

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10 ;

--
-- 转存表中的数据 `task`
--

INSERT INTO `task` (`tid`, `pid`, `creater`, `title`, `content`, `status`, `createtime`, `expecttime`, `finishtime`, `participant`) VALUES
(1, 1, 13, 'aaaa', '', 0, '2014-12-04 06:52:49', '2014-12-05 03:41:00', '0000-00-00 00:00:00', '[11]'),
(2, 1, 13, 'aa', '', 0, '2014-12-04 08:09:16', '2014-12-05 03:41:01', '0000-00-00 00:00:00', '[11,13]'),
(3, 1, 13, 'aa', '', 0, '2014-12-04 06:45:59', '2014-12-05 03:41:01', '0000-00-00 00:00:00', '[11]'),
(4, 1, 13, 'aa', '', 0, '2014-12-04 06:45:59', '2014-12-05 03:41:01', '0000-00-00 00:00:00', '[11]'),
(5, 1, 13, 'aasdafasd', '', 0, '2014-12-04 06:53:02', '2014-12-05 03:41:00', '0000-00-00 00:00:00', '[11]'),
(7, 1, 13, 'aa', '', 0, '2014-12-04 06:45:59', '2014-12-05 03:41:01', '0000-00-00 00:00:00', '[11]'),
(8, 1, 13, 'aa', '', 0, '2014-12-04 06:45:59', '2014-12-05 03:41:01', '0000-00-00 00:00:00', '[11]'),
(9, 14, 13, '我是第一个任务', '', 0, '2014-12-04 08:28:43', '2015-12-04 08:30:00', '0000-00-00 00:00:00', '[11,13]');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=15 ;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`uid`, `cid`, `gid`, `username`, `email`, `password`, `createtime`, `contact`, `gender`, `accessibility`) VALUES
(10, 0, 0, 'liyawen', '413235793@qq.com', 'a95a42d0088fc0d240262959270c5e5cd465226b', '1416312146586', '15019499703', '女', 0),
(11, 1, 1, 'Aron', '273305282@qq.com', '22acfa0ed5e62263fe522b06876d9f78fe9c0479', '1416326684633', '', '男', 0),
(13, 3, 1, '叶德颖', 'kanwode918@qq.com', '0fc213126df2decaff2a169ca50ede8e04682c03', '1416498219505', '13760284409', '男', 1),
(14, 0, 2, '叶德颖', '945173727@qq.com', '29ce1c535cd9dd3f6b1bab4b1e77618040ef1464', '1417574147961', '', '未知', 0);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
