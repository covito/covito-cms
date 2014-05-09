package com.covito.dbunit;

import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import org.dbunit.database.DatabaseConnection;
import org.dbunit.database.IDatabaseConnection;
import org.dbunit.database.QueryDataSet;
import org.dbunit.dataset.excel.XlsDataSet;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DbunitTest{

	private static Logger log=LoggerFactory.getLogger("DbunitTest");
	
	private static IDatabaseConnection connection;
	
	private static List<String> tableName=new ArrayList<String>();
	
	
	/**
	 * Beforeclass是在创建这个类之前所做的操作<br/>
	 * 这个方法必须为static<br/>
	 * 该方法在junit测试中会被最先调用，并且只会调用一次。
	 * @throws Exception 
	 */
	@BeforeClass
	public static void init() throws Exception{
		log.debug("init() BeforeClass");
		ResourceBundle rb=ResourceBundle.getBundle("jdbc");
		Class.forName(rb.getString("jdbc.driver"));
		Connection conn = DriverManager.getConnection(rb.getString("jdbc.url"), rb.getString("jdbc.username"), rb.getString("jdbc.password"));
		ResultSet stat=conn.getMetaData().getTables(null, null, "%", new String[]{"TABLE"});
		while(stat.next()){
			tableName.add(stat.getString(3));
		}
		connection = new DatabaseConnection(conn);
	}
	
	@Test
	public void exportExcel() throws Exception {
		QueryDataSet dataSet=new QueryDataSet(connection);
		for(String t:tableName){
			dataSet.addTable(t);
		}
		XlsDataSet.write(dataSet, new FileOutputStream("db/default/cms-data.xls"));
	}

}
