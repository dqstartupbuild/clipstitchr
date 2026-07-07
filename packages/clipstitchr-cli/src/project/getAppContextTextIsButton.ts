export function getAppContextTextIsButton(text: string) {
  return /\b(accept|add|apply|cancel|choose|connect|continue|copy|create|delete|download|edit|export|finish|generate|import|open|publish|queue|record|reject|review|run|save|select|sign in|start|upload|use)\b/i.test(
    text,
  );
}
