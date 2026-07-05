package com.gamesphere.game.service;

import com.gamesphere.game.entity.Game;
import com.gamesphere.game.repository.GameRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;

    public Game addGame(Game game) {
        if (gameRepository.existsByName(game.getName())) {
            throw new RuntimeException("Game with this name already exists");
        }
        return gameRepository.save(game);
    }

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Game getGameById(Long id) {
        return gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
    }

    public List<Game> searchGames(String keyword) {
        return gameRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    public List<Game> getGamesByGenre(String genre) {
        return gameRepository.findByGenreIgnoreCase(genre);
    }

    @PostConstruct
    public void seedGames() {
        if (gameRepository.count() == 0) {
            gameRepository.save(Game.builder()
                    .name("Elden Ring")
                    .description("Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. A masterpiece open-world action RPG created by FromSoftware and George R. R. Martin.")
                    .genre("RPG")
                    .platform("PC, PlayStation, Xbox")
                    .releaseYear(2022)
                    .rating(4.9)
                    .imageUrl("https://images.unsplash.com/photo-1651079985954-c94411130d21?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("Cyberpunk 2077")
                    .description("An open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped in a do-or-die fight for survival. Featuring Keanu Reeves and stunning futuristic aesthetics.")
                    .genre("RPG")
                    .platform("PC, PlayStation, Xbox")
                    .releaseYear(2020)
                    .rating(4.5)
                    .imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("Red Dead Redemption 2")
                    .description("America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America.")
                    .genre("Action")
                    .platform("PC, PlayStation, Xbox")
                    .releaseYear(2018)
                    .rating(4.9)
                    .imageUrl("https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("Valorant")
                    .description("A character-based 5v5 tactical shooter set on the global stage. Outplay, outwork, and outshine your competition with tactical abilities, precise gunplay, and adaptive teamwork.")
                    .genre("Shooter")
                    .platform("PC")
                    .releaseYear(2020)
                    .rating(4.3)
                    .imageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("GTA V")
                    .description("When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the underworld, they must pull off a series of dangerous heists.")
                    .genre("Action")
                    .platform("PC, PlayStation, Xbox")
                    .releaseYear(2013)
                    .rating(4.7)
                    .imageUrl("https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("Minecraft")
                    .description("Explore infinite worlds and build everything from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode, crafting weapons and armor.")
                    .genre("Sandbox")
                    .platform("PC, Mobile, Console")
                    .releaseYear(2011)
                    .rating(4.8)
                    .imageUrl("https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("God of War")
                    .description("His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive... and teach his son to do the same.")
                    .genre("Action")
                    .platform("PC, PlayStation")
                    .releaseYear(2018)
                    .rating(4.9)
                    .imageUrl("https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=80")
                    .build());

            gameRepository.save(Game.builder()
                    .name("The Witcher 3: Wild Hunt")
                    .description("You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon.")
                    .genre("RPG")
                    .platform("PC, PlayStation, Xbox, Switch")
                    .releaseYear(2015)
                    .rating(4.8)
                    .imageUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80")
                    .build());
        }
    }
}
