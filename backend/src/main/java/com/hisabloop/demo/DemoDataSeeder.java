package com.hisabloop.demo;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import com.hisabloop.config.AppProperties;
import com.hisabloop.receipt.storage.FileStorage;

/**
 * Loads the fictional "Shinde Agro Traders" dataset. Runs ONLY with the {@code demo} Spring profile
 * and only when hisabloop.demo.seed=true and the demo company is not present yet, so it can never
 * touch a production database by accident. Re-run safely: it is a no-op once seeded.
 *
 * Demo seed SQL and demo receipt images are copied into the
 * configured private storage directory.
 */
@Component
@Profile("demo")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_COMPANY_NAME = "Shinde Agro Traders";

    private final DataSource dataSource;
    private final JdbcTemplate jdbc;
    private final FileStorage storage;
    private final AppProperties properties;
    private final Environment environment;

    public DemoDataSeeder(DataSource dataSource, FileStorage storage, AppProperties properties,
            Environment environment) {
        this.dataSource = dataSource;
        this.jdbc = new JdbcTemplate(dataSource);
        this.storage = storage;
        this.properties = properties;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (environment.acceptsProfiles(Profiles.of("prod"))) {
            throw new IllegalStateException(
                    "Refusing to start: the 'demo' and 'prod' profiles must never be active together");
        }
        if (properties.demo() == null || !properties.demo().seed()) {
            log.info("Demo profile active but hisabloop.demo.seed=false; skipping demo data");
            return;
        }
        Integer existing = jdbc.queryForObject("SELECT COUNT(*) FROM companies WHERE name = ?", Integer.class,
                DEMO_COMPANY_NAME);
        if (existing != null && existing > 0) {
            log.info("Demo data already present; skipping");
            copyReceipts();
            return;
        }
        log.warn("Loading DEVELOPMENT demo data (fictional companies and users, password Demo@12345)");
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                new ClassPathResource("db/demo/demo_seed.sql"));
        populator.setSqlScriptEncoding("UTF-8");
        populator.setContinueOnError(false);
        populator.execute(dataSource);
        copyReceipts();
        log.info("Demo data loaded");
    }

    /** Copies receipt images to the storage keys referenced by the seeded receipts table. */
    private void copyReceipts() {
        try {
            Resource[] files = new PathMatchingResourcePatternResolver().getResources("classpath:demo/receipts/*.png");
            var rows = jdbc.queryForList("SELECT storage_key FROM receipts WHERE storage_key LIKE 'demo/%'",
                    String.class);
            for (String key : rows) {
                if (storage.exists(key)) {
                    continue;
                }
                String filename = key.substring(key.lastIndexOf('/') + 1);
                for (Resource r : files) {
                    if (filename.equals(r.getFilename())) {
                        try (InputStream in = r.getInputStream()) {
                            storage.storeAt(key, in.readAllBytes());
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Could not copy demo receipts", e);
        }
    }
}
