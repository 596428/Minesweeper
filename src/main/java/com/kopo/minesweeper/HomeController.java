package com.kopo.minesweeper;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {
    @GetMapping("/")
    public String home(Locale locale, Model model) {
        return "home";
    }

    @ResponseBody
    @GetMapping(value = "/createBoard", produces = "application/json")
    public Map<String, String> createBoard(@RequestParam("rows") int rows, @RequestParam("cols") int cols,
            @RequestParam("mines") int mines) {
        Map<String, String> response = new HashMap<>();
        boolean[][] board = new boolean[rows][cols];
        Random random = new Random();
        int mineCount = 0;

        while (mineCount < mines) {
            int row = random.nextInt(rows);
            int col = random.nextInt(cols);
            if (!board[row][col]) {
                board[row][col] = true;
                mineCount++;
            }
        }
        StringBuilder boardString = new StringBuilder();
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                boardString.append(board[i][j] ? "M" : "0");
            }
            if (i < rows - 1)
                boardString.append(",");
        }
        response.put("board", boardString.toString());
        return response;
    }

    @ResponseBody
    @GetMapping(value = "/checkMine", produces = "application/json")
    public Map<String, Boolean> checkMine(@RequestParam("row_String") String row_String, @RequestParam("col_String") String col_String, @RequestParam("board") String board) {
        Map<String, Boolean> response = new HashMap<>();
        int row = Integer.parseInt(row_String);
        int col = Integer.parseInt(col_String);
        String[] rows = board.split(",");
        boolean isMine = rows[row].charAt(col) == 'M';
        response.put("isMine", isMine);
        return response;
    }

}
