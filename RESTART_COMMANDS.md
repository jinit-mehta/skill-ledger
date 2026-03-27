
### 1. Restart Backend
```bash
# In separate terminal
cd backend
npm run dev
```

### 2. Restart Frontend
```bash
# In separate terminal
cd frontend
npm run dev
```

### 3. Restart ML Server
```bash
# In separate terminal
cd ml
source venv/bin/activate
python src/server.py
```

### 4. Deploy Smart Contracts (If needed)
**Note:** Run this from the project root, NOT inside contracts folder if you are already there.
```bash
cd contracts
npx hardhat run scripts/deploy.js --network ganache
```
*If you are already inside the `contracts` directory, just run:*
```bash
npx hardhat run scripts/deploy.js --network ganache
```
