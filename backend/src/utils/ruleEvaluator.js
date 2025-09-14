export function astToMongoQuery(ast) {
  if(!ast) return {};
  const ops = {
    'AND': '$and',
    'OR': '$or'
  };

  function nodeToQuery(node) {
    if(node.op && node.children && Array.isArray(node.children)) {
      const mapped = node.children.map(nodeToQuery).filter(Boolean);
      return { [ops[node.op]]: mapped };
    }

    const { field, operator, value } = node;

    switch(operator) {
      case '>': return { [field]: { $gt: value } };
      case '>=': return { [field]: { $gte: value } };
      case '<': return { [field]: { $lt: value } };
      case '<=': return { [field]: { $lte: value } };
      case '==': 
      case '=': return { [field]: value };
      case 'in': return { [field]: { $in: value } };
      case 'contains': return { [field]: { $in: Array.isArray(value) ? value : [value] } };
      case 'not_contains': return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
      case 'older_than_days': {
          const d = new Date();
          d.setDate(d.getDate() - Number(value));
          return { [field]: { $lte: d } };
      }
      case 'newer_than_days': {
          const d = new Date();
          d.setDate(d.getDate() - Number(value));
          return { [field]: { $gte: d } };
      }
      default:
          throw new Error('Unsupported operator: ' + operator);
    }
  }
  
  return nodeToQuery(ast);
}