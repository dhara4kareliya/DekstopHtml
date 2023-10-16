import "./popup";
import "./tabs";
import "./checkbox";
import "./slider";
import "./gameActions";

const viewOptionsButtonHTML = `<table>
<tr>
    <td><div></div></td>
    <td><div></div></td>
    <td><div></div></td>
</tr>
<tr>
    <td><div></div></td>
    <td><div></div></td>
    <td><div></div></td>
</tr>
<tr>
    <td><div></div></td>
    <td><div></div></td>
    <td><div></div></td>
</tr>
</table>`;

setupAllViewOptionsButtons();

function setupViewOptionsButton (viewOptionsButton) {
    viewOptionsButton.innerHTML = viewOptionsButtonHTML;
}

function setupAllViewOptionsButtons () {
    const viewOptionsButtons = $(".viewOptionsButton");
    for (const viewOptionsButton of viewOptionsButtons) {
        setupViewOptionsButton(viewOptionsButton);
    }
}

export default {
    setupAllViewOptionsButtons
};