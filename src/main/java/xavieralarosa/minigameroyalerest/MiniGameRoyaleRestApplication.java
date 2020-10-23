package xavieralarosa.minigameroyalerest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages={"xavieralarosa"})
public class MiniGameRoyaleRestApplication {

	public static void main(String[] args) {
		SpringApplication.run(MiniGameRoyaleRestApplication.class, args);
	}

}
