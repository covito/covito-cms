covito-cms
==========

根据jeecms优化

初始化数据库：

先修改src/main/resources下的jdbc.properties下的数据库，用户名和密码

antrun:run  -Pinit-db

或

运行db/init-db.bat脚本

jetty运行：

jetty:run
