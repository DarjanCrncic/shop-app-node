
const deleteProduct = (button) => {
    const id = button.id.replace(/\D/g,'');
    const csrf = button.parentNode.querySelector('[name=_csrf]').value;

    const productElement = button.closest('article');
    
    fetch('/admin/product/' + id, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    }).then(result => {
        return result.json();
    }).then(data => {
        console.log(data);
        productElement.parentNode.removeChild(productElement);
    }).catch(err => {
        console.log(err);
    });
};