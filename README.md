# alignelements

*   jQuery плагин для выравнивания элементов
*
*   $('.container').alignelements();
*   $('.container').alignelements(false);
*   $('.container').alignelements('.title');
*   $('.container').alignelements('.title', false);
*   $('.container').alignelements({
*       items : '>li',              // указываем какие именно элементы выравнивать, по умолчанию берется дочерние элементы
*       by    : '.title',           // указываем внутренний элемент к которому задается недостущая высота, если указать несколько элементов чрез запятую, то скрипт будет выравнивать эти элементы между собой
*       liquid: false               // если контейнер динамичный, т.е. меняется ширина при изменении размера окна, то высота элементов автоматически пересчитывается, по умолчанию true
*   });
