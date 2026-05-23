package com.watchflix.demo.config;

import java.sql.Connection;
import java.sql.SQLException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DatabaseConnection {
    private static final String URL =  "jdbc:postgresql://localhost:5432/postgres";
    private static final String USER = "postgres";
    private static final String PASSWORD = "password";
    private HikariDataSource dataSource = null;
    private static DatabaseConnection databaseConnection = null;

    private DatabaseConnection() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(URL);
        config.setUsername(USER);
        config.setPassword(PASSWORD);
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

        dataSource = new HikariDataSource(config);
    }

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
    public static void closeConnection() {
        if (databaseConnection != null && databaseConnection.dataSource != null) {
            try {
                databaseConnection.dataSource.close();
                databaseConnection = null;
            } catch (Exception e) {
                System.err.println("Error closing data source: " + e.getMessage());
            }
        }
    }
    public static DatabaseConnection getInstance(){
        if(databaseConnection == null) {
            databaseConnection = new DatabaseConnection();
        }
        return databaseConnection;
    }
}
