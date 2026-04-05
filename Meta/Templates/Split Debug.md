<%*
const root = app.workspace.rootSplit;
const leftTabGroup = root.children[0];
const rightSplit = root.children[1];
const topRightTabGroup = rightSplit.children[0];

new Notice("Left children count: " + leftTabGroup.children?.length);
new Notice("Left child[0] type: " + leftTabGroup.children?.[0]?.constructor?.name);
new Notice("Left child[0] has openFile: " + (typeof leftTabGroup.children?.[0]?.openFile === "function"));

new Notice("TopRight children count: " + topRightTabGroup.children?.length);
new Notice("TopRight child[0] type: " + topRightTabGroup.children?.[0]?.constructor?.name);
new Notice("TopRight child[0] has openFile: " + (typeof topRightTabGroup.children?.[0]?.openFile === "function"));
%>