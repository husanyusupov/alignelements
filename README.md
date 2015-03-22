# alignelements

jQuery плагин для выравнивания элементов
    
    $('.container').alignelements(); // Простой вызов
    
    $('.container').alignelements(false); // Не учитывать динамичность

    $('.container').alignelements('.title'); // Выравнить элементы по внутреннему элементу ".title"
    
    $('.container').alignelements('.title', false); // Вышесказанные сразу

Параметры объектом, тут добавочно можно указать параметр "items".
    
    $('.container').alignelements({
        items : '>li',              // указываем какие именно элементы выравнивать, 
                                    // по умолчанию берутся дочерние элементы

        by    : '.title',           // указываем внутренний элемент к которому добавляется 
                                    // недостающая высота, если указать несколько элементов 
                                    // через запятую, то скрипт будет выравнивать эти 
                                    // элементы между собой, а не сам элемент из списка

        liquid: false               // если контейнер нединамичный, указываем false
    });

### Дополнительно о параметре `"by"`.

Если у нас есть такая разметка:
    
    <ul class="container">
        <li>
            <div class="title"></div>
            <div class="image"></div>
            <div class="footer"></div>
        </li>
        <li>
            <div class="title"></div>
            <div class="image"></div>
            <div class="footer"></div>
        </li>
        <li>
            <div class="title"></div>
            <div class="image"></div>
            <div class="footer"></div>
        </li>
    </ul>

##### \- выравнить элементы `.container > li`:
    
    $('.container').alignelements();` 
##### \- выравнить элементы `.container > li`, но не достающую высоту добавить к элементу `.title`:
    
    $('.container').alignelements('.title');
##### \- выравнить элементы `.title` и `.footer` между собой:
    
    $('.container').alignelements('.title, .footer');

## Методы
##### Обновить с передачей новых настроек или без:
    
    $container.alignelements('update', opt);
    $container.alignelements('update');
`opt` может быть только объектом. А также `opt` можно не передавать, в этом сучае будет переинициализация. Это удобно если один из элементов контейнера был обновлен динамически (например, путем `ajax`).

А также можно просто заново вызвать `$container.alignelements([arg1], [arg1] || [obj]);` или `$container.alignelements();` тогда будет переинициализация с новыми параметрами или просто переинициализация.

##### Выравнить вручную:
    
    $container.alignelements('align');
##### Открепить плагин:
    
    $container.alignelements('destroy');
