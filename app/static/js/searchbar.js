/**
 * Searches the given input in the given table
 * @param {*} inputID
 * @param {*} tableID 
 * @param {*} tableDataIndex 
 */
 function search(inputID, tableID, tableDataIndex) {

    let input, filter, table, tr, td, i, txtValue;

    input = document.getElementById(inputID);
    filter = input.value.toUpperCase();
    table = document.getElementById(tableID);
    tr = table.getElementsByTagName('tr');

    for (i = 0; i < tr.length; i++){

        // taking username
        td = tr[i].getElementsByTagName('td')[tableDataIndex];

        if (td) {
            txtValue = td.textContent || td.innerText;

            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = '';
            } else {
                tr[i].style.display = 'none';
            }
        }

    }

}