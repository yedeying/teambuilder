-- phpMyAdmin SQL Dump
-- version 4.0.9
-- http://www.phpmyadmin.net
--
-- 主机: 127.0.0.1
-- 生成日期: 2015-01-14 16:53:25
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
  `description` text NOT NULL,
  `status` varchar(100) NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=26 ;

--
-- 转存表中的数据 `comment`
--

INSERT INTO `comment` (`cid`, `id`, `uid`, `type`, `deep`, `time`, `content`, `description`, `status`) VALUES
(1, 1, 13, 0, 0, '2014-12-16 03:21:31', '新名字fas', 'gagagagagagfdsaf', 'create'),
(2, 1, 13, 4, 1, '2014-12-15 04:10:41', '我是第一个回复', '', 'comment'),
(4, 1, 13, 0, 0, '2014-12-15 06:57:25', 'the newest', '', 'create'),
(5, 2, 13, 0, 0, '2014-12-15 06:57:51', 'a new', '', 'create'),
(6, 14, 13, 0, 0, '2015-01-14 15:00:32', 'sdfasdf', 'test', 'create'),
(7, 13, 13, 0, 0, '2014-12-15 08:01:40', 'aaa', '', 'create'),
(8, 1, 13, 4, 1, '2014-12-15 04:10:41', '我是第二个回复', '', 'comment'),
(12, 1, 13, 4, 1, '2014-12-15 12:18:48', '发送', '', 'comment'),
(13, 1, 13, 4, 1, '2014-12-15 12:20:31', '我是第三个回复', '', 'comment'),
(14, 1, 13, 4, 1, '2014-12-15 12:25:32', 'haha', '', 'comment'),
(15, 4, 13, 4, 1, '2014-12-15 12:26:29', 'lalala', '', 'comment'),
(16, 1, 13, 4, 1, '2014-12-22 15:20:04', 'hehehe', '', 'comment'),
(17, 1, 13, 0, 0, '2015-01-03 16:08:04', 'hagaga', '', 'create'),
(18, 17, 13, 4, 1, '2015-01-03 16:08:11', 'sadfadf', '', 'comment'),
(19, 17, 13, 4, 1, '2015-01-03 16:08:14', 'dsafasdf', '', 'comment'),
(20, 17, 13, 4, 1, '2015-01-06 15:41:11', '123\n', '', 'comment'),
(21, 6, 13, 4, 1, '2015-01-14 15:00:12', '沙发', '', 'comment'),
(22, 6, 13, 4, 1, '2015-01-14 15:00:21', '板凳', '', 'comment'),
(23, 18, 13, 0, 0, '2015-01-14 15:30:22', '123', 'sadfas', 'create'),
(24, 23, 13, 4, 1, '2015-01-14 15:30:16', 'sdfsaf', '', 'comment');

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
  `participant` varchar(1000) NOT NULL,
  `finish` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`did`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=26 ;

--
-- 转存表中的数据 `detail`
--

INSERT INTO `detail` (`did`, `tid`, `title`, `content`, `createtime`, `participant`, `finish`) VALUES
(3, 2, 'ye', 'aa', '2014-12-12 03:51:17', '[11,13]', 1),
(5, 2, 'asf', 'sfdfasdf', '2014-12-12 03:54:23', '[11,13]', 1),
(6, 9, 'asf', 'sdf', '2014-12-12 03:56:40', '[11,13]', 0),
(8, 2, 'hgh', 'afds', '2014-12-12 06:41:53', '[11,13]', 1),
(9, 2, 'a', 'f', '2014-12-12 06:45:10', '[11]', 0),
(10, 10, 'af', 'asf', '2014-12-12 10:11:54', '[13]', 0),
(11, 13, 'af', 'fsdfg', '2014-12-12 10:57:48', '[11]', 0),
(12, 2, '我是来传文件的', 'yeyeey', '2014-12-12 11:48:55', '[11]', 0),
(13, 2, 'as', 'sa', '2014-12-17 07:52:45', '[11]', 0),
(14, 2, 'sdaf', 'sadf', '2014-12-17 07:56:09', '[11]', 0),
(15, 2, 'fadsfsdf', 'afsd', '2015-01-03 15:58:43', '[13]', 0),
(16, 2, 'yeyeye', 'fff', '2015-01-03 16:02:50', '[11,13]', 0),
(17, 2, 'fadaf', 'fdasf', '2015-01-03 16:05:25', '[11,13]', 0),
(18, 2, 'dsaf', 'dsaf', '2015-01-03 16:06:53', '[11,13]', 0),
(19, 15, '测试1', '测试2', '2015-01-06 15:48:58', '[11]', 0),
(20, 18, '  1', '    ', '2015-01-13 12:08:31', '[11,13]', 1),
(21, 18, '   东奔西走', '123', '2015-01-13 12:46:22', '[11,13]', 0),
(22, 9, '1', 'abc', '2015-01-14 14:50:49', '[13]', 1);

-- --------------------------------------------------------

--
-- 表的结构 `file`
--

CREATE TABLE IF NOT EXISTS `file` (
  `fid` bigint(20) NOT NULL AUTO_INCREMENT,
  `id` bigint(20) NOT NULL,
  `folder` bigint(20) NOT NULL,
  `uploader` bigint(20) NOT NULL,
  `type` int(11) NOT NULL,
  `filename` varchar(1024) NOT NULL,
  `size` varchar(100) NOT NULL,
  `fsha1` varchar(40) NOT NULL,
  `timestamp` varchar(100) NOT NULL,
  `uploadtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=44 ;

--
-- 转存表中的数据 `file`
--

INSERT INTO `file` (`fid`, `id`, `folder`, `uploader`, `type`, `filename`, `size`, `fsha1`, `timestamp`, `uploadtime`) VALUES
(21, 1, 1, 13, 3, 'teambuilder.sql', '15827', 'ac8b217567f44db34c8b7c6971ee538a36c17221', '1419663198801', '2015-01-06 15:59:44'),
(22, 1, 8, 13, 3, 'teambuilder.sql', '15827', 'ac8b217567f44db34c8b7c6971ee538a36c17221', '1419663205739', '2015-01-14 15:44:10'),
(23, 1, 5, 13, 3, 'rules', '391', 'ac825e06b74d7436fb250f69254187b8cfa8ac9d', '1419663238251', '2014-12-27 06:53:58'),
(24, 1, 5, 13, 3, 'task', '102', '4bb4da99fc4931391c4e04ac90f3fe29ca29520f', '1419663238252', '2014-12-27 06:53:58'),
(31, 8, 0, 13, 1, '1-12120Q05A1.jpg', '692740', 'da67a7300152082616833b77ba45ed6c140d40f8', '1420300696684', '2015-01-03 15:58:16'),
(32, 17, 0, 13, 1, '4aa5b28ctw1duuxxy6l1lj.jpg', '21717', '7992f706e58d7954a9a487ecad851849a6b7b453', '1420301125825', '2015-01-03 16:05:25'),
(33, 18, 0, 13, 1, '6b6e567cjw1ds4zbux8upj.jpg', '54878', '1d9c4984d651b6166f0c64be85032cf7549e5e5a', '1420301213661', '2015-01-03 16:06:53'),
(34, 18, 0, 13, 1, '6aaeb4b8gw1duuiijszwqj.jpg', '129788', 'c3175a017d62db9fb4c44a7e568563e4948cc056', '1420301213665', '2015-01-03 16:06:53'),
(35, 1, 5, 13, 3, '明道产品分析.docx', '1724587', 'ede28026ee1149c73bb4e3d5c95e0e27dedb1b1f', '1420559327137', '2015-01-06 15:48:47'),
(37, 1, 5, 13, 3, 'cnblog.css', '1584', 'fd5bd8a8badfa644a8620219828b4cfc5341e2b6', '1421159457484', '2015-01-13 14:30:57'),
(38, 1, 5, 13, 3, 'Ecma-262.pdf', '3270645', 'cf177e8a8b76f5196e2116c5efc2de33d44f0937', '1421159475933', '2015-01-13 14:31:15'),
(39, 22, 0, 13, 1, '第一版本架构设计.docx', '505345', '93c89a6b61226f5fadb078f9fc3995619bdad49a', '1421247520880', '2015-01-14 14:58:40'),
(40, 1, 1, 13, 3, '测试报告--日程.docx', '16390', 'ab1369e4ab2c7c25c0ea68faa6f5414f1bea9d14', '1421247774897', '2015-01-14 15:04:26'),
(41, 23, 0, 13, 1, '~~~~~小组竞品分析报告.docx', '1512934', '5b62f5779be0884a5662d2308896aae28c6bfb56', '1421249318754', '2015-01-14 15:28:38'),
(42, 1, 8, 13, 3, '~~~~~小组竞品分析报告.docx', '1512934', '5b62f5779be0884a5662d2308896aae28c6bfb56', '1421250372254', '2015-01-14 15:46:12'),
(43, 1, 10, 13, 3, '1-12120Q05A1.jpg', '692740', 'da67a7300152082616833b77ba45ed6c140d40f8', '1421250446431', '2015-01-14 15:47:26');

-- --------------------------------------------------------

--
-- 表的结构 `folder`
--

CREATE TABLE IF NOT EXISTS `folder` (
  `fid` bigint(20) NOT NULL AUTO_INCREMENT,
  `gid` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`fid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=11 ;

--
-- 转存表中的数据 `folder`
--

INSERT INTO `folder` (`fid`, `gid`, `name`) VALUES
(1, 1, 'the first folder'),
(5, 1, 'the second folder'),
(8, 1, 'the third folder');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- 转存表中的数据 `groups`
--

INSERT INTO `groups` (`gid`, `cid`, `admin`, `name`, `memberlist`) VALUES
(1, 1, 13, 'teambuilder小组', '[11,13]'),
(2, 0, 14, 'yedeying', ''),
(3, 0, 15, 'SZU', ''),
(4, 0, 16, '岗位实践', '');

-- --------------------------------------------------------

--
-- 表的结构 `invite`
--

CREATE TABLE IF NOT EXISTS `invite` (
  `iid` bigint(20) NOT NULL AUTO_INCREMENT,
  `user` varchar(100) NOT NULL,
  `admin` varchar(100) NOT NULL,
  `sha1code` varchar(100) NOT NULL,
  PRIMARY KEY (`iid`),
  UNIQUE KEY `iid` (`iid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- 转存表中的数据 `invite`
--

INSERT INTO `invite` (`iid`, `user`, `admin`, `sha1code`) VALUES
(1, '945173727@qq.com', 'kanwode918@qq.com', '84d743a860e95e5f94cad2346bba4608427961a0'),
(2, '531074799@qq.com', 'kanwode918@qq.com', '0542b5585b5791374f630a00fcd8b7d782bb827a');

-- --------------------------------------------------------

--
-- 表的结构 `note`
--

CREATE TABLE IF NOT EXISTS `note` (
  `nid` bigint(20) NOT NULL AUTO_INCREMENT,
  `gid` bigint(20) NOT NULL,
  `uid` bigint(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `content` text NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `visible` varchar(1000) NOT NULL,
  `tag` varchar(100) NOT NULL,
  PRIMARY KEY (`nid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=12 ;

--
-- 转存表中的数据 `note`
--

INSERT INTO `note` (`nid`, `gid`, `uid`, `title`, `description`, `content`, `time`, `visible`, `tag`) VALUES
(1, 1, 13, 'the first note', '2nd', '', '2014-12-26 18:33:03', '[11]', 'secondx'),
(2, 1, 13, 'the second note', '2nd', '<div style="text-align: left;"><font size="4">要考试了,呵呵呵</font></div><div style="text-align: center;"><font size="4"><br></font></div><div style="text-align: left;"><img src="data:image/jpeg;base64,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"><br></div>', '2015-01-01 09:03:36', '[11,13]', 'secfff'),
(3, 1, 13, 'hahahaha', '', '<div style="text-align: center;">aaaa</div>', '2015-01-01 07:26:30', '[11,13]', 'first'),
(4, 1, 13, '笔记随便写', '~~~~', '随便谢谢', '2015-01-06 16:02:25', '[11,13]', 'first'),
(5, 1, 13, '随便写', '11', '11111111', '2015-01-06 16:01:50', '[11]', ''),
(6, 1, 13, '随便写', '11111', '1111111111', '2015-01-06 16:02:11', '[11,13]', ''),
(7, 1, 13, '123', '123', '1322222222222222222222222222222222222222sdfffffffffffffff &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; .......', '2015-01-13 09:03:15', '[11,13]', '1231231213'),
(8, 1, 13, '1', '', '123', '2015-01-13 09:10:15', '[11]', ''),
(9, 1, 13, ' ', '', '&nbsp;', '2015-01-13 09:10:43', '[11]', ''),
(10, 1, 13, '   ', '', '&nbsp;&nbsp;', '2015-01-13 09:11:10', '[11]', '');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=19 ;

--
-- 转存表中的数据 `project`
--

INSERT INTO `project` (`pid`, `gid`, `creater`, `name`, `description`, `createtime`, `status`) VALUES
(1, 1, 13, 'teambuilder', '这是teambuilder项目，属于岗位实践课程', '2014-11-20 18:56:52', 0),
(2, 1, 13, '第二个Project', '第二个Projectchange', '2014-11-20 20:54:18', 0),
(13, 1, 13, 'test', 'test', '2014-11-23 09:02:52', 0),
(14, 1, 13, '啦啦啦第四个项目', '啦啦啦第四个项目', '2014-12-01 07:40:26', 0),
(16, 2, 14, 'aaa', 'aaa', '2014-12-03 02:48:13', 0),
(18, 1, 13, 'test', '1223445', '2015-01-14 15:27:54', 0);

-- --------------------------------------------------------

--
-- 表的结构 `publish`
--

CREATE TABLE IF NOT EXISTS `publish` (
  `pid` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) NOT NULL,
  `gid` bigint(20) NOT NULL,
  `content` text NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pid`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=9 ;

--
-- 转存表中的数据 `publish`
--

INSERT INTO `publish` (`pid`, `uid`, `gid`, `content`, `time`) VALUES
(1, 13, 1, '哈哈哈我是第一个上榜', '2014-12-16 06:17:23'),
(8, 13, 1, '我是公告', '2015-01-14 15:05:25');

-- --------------------------------------------------------

--
-- 表的结构 `schedule`
--

CREATE TABLE IF NOT EXISTS `schedule` (
  `sid` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `detail` varchar(100) NOT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=23 ;

--
-- 转存表中的数据 `schedule`
--

INSERT INTO `schedule` (`sid`, `uid`, `timestamp`, `title`, `detail`) VALUES
(10, 13, 1420559520800, '123', 'abc'),
(11, 13, 1420041600753, 'test', ''),
(12, 13, 1420041600617, '小组会议', '！@#￥%'),
(15, 13, 1420041600771, '12345', '12345'),
(16, 13, 1421157120999, '1', '123'),
(17, 13, 1420560000820, 'aa', 'a'),
(19, 13, 1421157600761, '会议安排123', '123123456'),
(20, 13, 1420128000956, '工', '工');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=22 ;

--
-- 转存表中的数据 `task`
--

INSERT INTO `task` (`tid`, `pid`, `creater`, `title`, `content`, `status`, `createtime`, `expecttime`, `finishtime`, `participant`) VALUES
(2, 1, 13, 'aa', '', 0, '2015-01-13 15:17:22', '2014-12-05 04:41:00', '0000-00-00 00:00:00', '[11,13]'),
(9, 14, 13, '我是第一个任务', '', 0, '2014-12-04 08:28:43', '2015-12-04 08:30:00', '0000-00-00 00:00:00', '[11,13]'),
(13, 13, 13, 'dsaf', '', 0, '2014-12-12 10:57:20', '2014-12-12 10:58:01', '0000-00-00 00:00:00', ''),
(14, 14, 13, 'fadsf', '', 0, '2015-01-03 15:19:31', '2015-01-03 15:21:00', '0000-00-00 00:00:00', ''),
(15, 1, 13, '测试测试', '', 0, '2015-01-06 15:45:53', '2015-01-07 04:00:00', '0000-00-00 00:00:00', ''),
(18, 1, 13, '123', '', 0, '2015-01-13 12:07:56', '2015-01-13 12:09:00', '0000-00-00 00:00:00', '');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='用户' AUTO_INCREMENT=7 ;

--
-- 转存表中的数据 `tmpuser`
--

INSERT INTO `tmpuser` (`uid`, `email`, `username`, `password`, `timestamp`, `createtime`, `tid`) VALUES
(1, '345411378@qq.com', 'error', 'a20c1366ad08f781d596075957bfa0d0b97c422d', '2015-01-06 15:35:05', '1420558505391', '280cfe23995eaba1243a898e76ba7f708e32abec'),
(2, '945173727@qq.com', '叶德颖', '7a8ef0b4cd26f53b90834ba9903e0d126ad4bb46', '2015-01-06 15:37:32', '1420558652753', '319c9bde627757295af4708279cae599b9311594');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=17 ;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`uid`, `cid`, `gid`, `username`, `email`, `password`, `createtime`, `contact`, `gender`, `accessibility`) VALUES
(10, 0, 0, 'liyawen', '413235793@qq.com', 'a95a42d0088fc0d240262959270c5e5cd465226b', '1416312146586', '15019499703', '女', 0),
(11, 4, 1, 'Aron', '273305282@qq.com', '22acfa0ed5e62263fe522b06876d9f78fe9c0479', '1416326684633', '13760289152', '男', 0),
(13, 3, 1, '叶德颖', 'kanwode918@qq.com', '0fc213126df2decaff2a169ca50ede8e04682c03', '1416498219505', '13760284409', '男', 1),
(14, 29, 0, 'HMJ', '531074799@qq.com', 'f35ca8c2b7649cb93bde300cb44ca6cffdd85e09', '1421248866349', '213123', '男', 0),
(15, 0, 3, 'HMJ', 'kinghmj@126.com', 'd249c98f2d302f3221832827b9a48c4309b04ac4', '1421249108713', '', '未知', 0),
(16, 0, 4, 'HMJ', 'kinghmjk@126.com', 'f93d5af25dad9f43a3ac3a028d84f6586c308268', '1421249194104', '', '未知', 0);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
