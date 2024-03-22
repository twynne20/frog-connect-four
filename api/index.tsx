import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';

type State = {
  board: string[][];
  winner: string | null;
};

export const app = new Frog<{ State: State }>({
  initialState: {
    board: Array.from({ length: 6 }, () => Array(7).fill('⚪')),
    winner: null
  }
});

const renderBoard = (board: string[][]): string => {
  const boardString = board.map(row => row.join('   ')).join('\n');
  const columnNumbers = '1     2     3     4     5    6    7 ';
  return `${boardString}\n${columnNumbers}`;
};

const emptyBoard = Array.from({ length: 6 }, () => Array(7).fill('⚪'));

const checkWinner = (board: string[][]): string | null => {
  const rows = board.length;
  const cols = board[0].length;

  // Check horizontal
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (board[row][col] !== '⚪' && board[row][col] === board[row][col + 1] && board[row][col] === board[row][col + 2] && board[row][col] === board[row][col + 3]) {
        return board[row][col];
      }
    }
  }

  // Check vertical
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] !== '⚪' && board[row][col] === board[row + 1][col] && board[row][col] === board[row + 2][col] && board[row][col] === board[row + 3][col]) {
        return board[row][col];
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (board[row][col] !== '⚪' && board[row][col] === board[row + 1][col + 1] && board[row][col] === board[row + 2][col + 2] && board[row][col] === board[row + 3][col + 3]) {
        return board[row][col];
      }
    }
  }

  // Check diagonal (bottom-left to top-right)
  for (let row = 3; row < rows; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (board[row][col] !== '⚪' && board[row][col] === board[row - 1][col + 1] && board[row][col] === board[row - 2][col + 2] && board[row][col] === board[row - 3][col + 3]) {
        return board[row][col];
      }
    }
  }

  return null;
};

app.frame('/', async (c) => {
    const state = await c.deriveState((previousState) => {
      previousState.board = emptyBoard;
      previousState.winner = null;
    });
  
    return c.res({
      action: '/submit',
      image: (
        <div style={{
          fontFamily: '"Lucida Console", Monaco, monospace',
          whiteSpace: 'pre',
          fontSize: '32px',
          backgroundColor: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          padding: '20px',
          borderRadius: '8px',
          border: '5px solid black',
          boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>Connect 4</div>
          <div>{renderBoard(state.board)}</div>
          <div style={{ marginTop: '20px' }}>Enter column number (1-7) to place your chip!</div>
        </div>
      ),
      intents: [
        <TextInput placeholder="Enter column number (1-7)" />,
        <Button>Submit</Button>
      ]
    });
  });
  
  app.frame('/submit', async (c) => {
    const { inputText, deriveState } = c;
  
    const state = await deriveState(async (previousState) => {
      const playerColumn = parseInt(inputText || '') - 1;
  
      if (!isNaN(playerColumn) && playerColumn >= 0 && playerColumn < 7) {
        for (let row = 5; row >= 0; row--) {
          if (previousState.board[row][playerColumn] === '⚪') {
            previousState.board[row][playerColumn] = '🔴';
            break;
          }
        }
  
        const winner = checkWinner(previousState.board);
        if (winner) {
          previousState.winner = winner;
          return;
        }
  
        const availableColumns = previousState.board[0].map((_, column) => column).filter(column => previousState.board[0][column] === '⚪');
        if (availableColumns.length > 0) {
          const botColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
          for (let row = 5; row >= 0; row--) {
            if (previousState.board[row][botColumn] === '⚪') {
              previousState.board[row][botColumn] = '🟡';
              break;
            }
          }
  
          const winner = checkWinner(previousState.board);
          if (winner) {
            previousState.winner = winner;
          }
        }
      }
    });
  
    const isValidInput = inputText !== undefined && !isNaN(parseInt(inputText)) && parseInt(inputText) >= 1 && parseInt(inputText) <= 7;
  
    return c.res({
      image: (
        <div style={{
          fontFamily: '"Lucida Console", Monaco, monospace',
          whiteSpace: 'pre',
          fontSize: '32px',
          backgroundColor: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          padding: '20px',
          borderRadius: '8px',
          border: '5px solid black',
          boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>Connect 4</div>
          <div>{renderBoard(state.board)}</div>
          <div style={{ marginTop: '20px' }}>
            {state.winner ? (
              state.winner === '🔴' ? 'You win!' : 'Bot wins!'
            ) : (
              isValidInput ? 'Enter your next move fren!' : 'Invalid input! Please enter a number between 1 and 7.'
            )}
          </div>
        </div>
      ),
      intents: state.winner ? [
        <Button action="/">New Game</Button>
      ] : [
        <TextInput placeholder="Enter column number (1-7)" />,
        <Button>Submit</Button>
      ],
      action: state.winner ? undefined : '/submit'
    });
  });
  
app.frame('/win', (c) => {
    return c.res({
      image: (
        <div style={{
          fontFamily: '"Lucida Console", Monaco, monospace',
          whiteSpace: 'pre',
          fontSize: '48px',
          backgroundColor: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          padding: '20px',
          borderRadius: '8px',
          border: '5px solid black',
          boxSizing: 'border-box'
        }}>
          Congratulations! You win!
        </div>
      ),
      intents: [
        <Button action="/">Play Again</Button>
      ]
    });
  });
  
app.frame('/lose', (c) => {
    return c.res({
      image: (
        <div style={{
          fontFamily: '"Lucida Console", Monaco, monospace',
          whiteSpace: 'pre',
          fontSize: '48px',
          backgroundColor: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          padding: '20px',
          borderRadius: '8px',
          border: '5px solid black',
          boxSizing: 'border-box'
        }}>
          Oops! The bot wins. Better luck next time!
        </div>
      ),
      intents: [
        <Button action="/">Play Again</Button>
      ]
    });
  });
  
  devtools(app, { serveStatic });