import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';

type State = {
  board: string[][];
};

export const app = new Frog<{ State: State }>({
  initialState: {
    board: Array.from({ length: 6 }, () => Array(7).fill('⚪'))
  }
});

const renderBoard = (board: string[][]): string => {
  return board.map(row => row.join(' ')).join('\n');
};

app.frame('/', (c) => {
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
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%'
      }}>
        Place your chip (Enter column number 1-7):
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
    }
  });

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
        <div>{renderBoard(state.board)}</div>
        <div style={{ marginTop: '20px' }}>Enter your next move:</div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter column number (1-7)" />,
      <Button>Submit</Button>
    ],
    action: '/submit'
  });
});

devtools(app, { serveStatic });