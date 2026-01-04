# Copilot Safety Rules for Infinity Brain

## READ THIS BEFORE EVERY CODE CHANGE

### Architecture Constraints
- This is a **GitHub Spark** app (sandboxed React runtime)
- Client-only, static deployment
- No backend, no Node.js, no build tools beyond what Spark provides

### FORBIDDEN (will break production)
- OAuth flows (Spark has built-in auth)
- localStorage for authentication (use spark.auth)
- window.crypto, Buffer, process.env
- Dynamic imports
- Server-side rendering assumptions
- Mutation of React state (no `state.x = y`)
- Moving/conditionalizing hooks
- Returning non-JSX from components

### REQUIRED Before Changes
1. Identify which constraint category your change touches
2. Verify it doesn't violate FORBIDDEN list
3. Explain your reasoning
4. Wait for approval

### Safe Patterns
```typescript
// ✅ GOOD: Spark storage
const [data, setData] = useKV('key', defaultValue);

// ❌ BAD: localStorage
localStorage.setItem('key', value);

// ✅ GOOD: State update
setItems([...items, newItem]);

// ❌ BAD: Direct mutation
items.push(newItem);
setState(items);

// ✅ GOOD: Component return
return <div>Content</div>;
return null;

// ❌ BAD: Component return
return undefined;
return someObject;
```

### Change Size Limits
- Max 3 files per PR
- Max 100 lines changed per PR
- If bigger, break into multiple PRs

### When In Doubt
- Ask before changing
- Prefer minimal diffs
- Prioritize working code over "better" code
