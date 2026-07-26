const fs = require('fs');
const readline = require('readline');
const fileStream = fs.createReadStream('C:/Users/anshs/.gemini/antigravity-ide/brain/100fcd39-7d7b-4a07-9bcf-1ee22e19e0e3/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

rl.on('line', (line) => {
    if(line.includes('"step_index":1746')) {
        const j = JSON.parse(line);
        const planCall = (j.tool_calls || []).find(c => c.name === 'write_to_file' && c.args.TargetFile.includes('implementation_plan.md'));
        if (planCall) {
            fs.writeFileSync('sprint12_plan.md', planCall.args.CodeContent);
            console.log('Wrote to sprint12_plan.md');
        }
    }
});
