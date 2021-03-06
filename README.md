# Renault IFRAME script

### Подключение

1. Добавьте следующий скрипт в раздел `<head>` вашей страницы:
  
  ```html
  <script src="https://live.renault.ru/gtm/?iframe"></script>
  ```

2. Добавьте следующий вызов после загрузки страницы:
  
  ```javascript
  RenaultFrame.resize();
  ```
  
  Например:
  
  ```javascript
   window.addEventListener('DOMContentLoaded', function () {
       RenaultFrame.resize();
   }, false);
  ```

3. Вызывайте `RenaultFrame.resize()` каждый раз, когда высота вашей страницы
  меняется.

### Использование

##### Изменение размера фрейма

- `RenaultFrame.resize()` автоматически подберет и установит нужный размер
  фрейма. Этот вызов нужно делать при каждом изменении размера страницы.
  
- `RenaultFrame.resize(height)` установит заданную высоту фрейма. Высоту
  необходимо передать в пикселях.
  
  Например: `RenaultFrame.resize(1160);`

##### Проскролливание страницы

- `RenaultFrame.scroll()` проскроллит до самого верха страницы.

- `RenaultFrame.scroll(position)` проскроллит до указанной позиции. Позицию
  необходимо передавать в пикселях от верхней границы фрейма (то есть,
  вашей страницы).
  
  Например: `RenaultFrame.scroll(650);`

- `RenaultFrame.scroll(element)` проскроллит до указанного элемента
  на странице.
  
  Например: `RenaultFrame.scroll( document.querySelector('h1') );`
  
- Если необходимо остановить скролл немного выше (или ниже) элемента,
  передайте смещение в пикселях вторым аргументом. Например, следующий
  вызов: `RenaultFrame.scroll(element, -50)` остановит скролл на 50 пикселей
  выше элемента `element`.
  
  По умолчанию используется смещение `-16`.
  
- `RenaultFrame.scroll(selector)` проскроллит до элемента, указанного селектором,
  на _родительской странице_.
  
  Например: `RenaultFrame.scroll('.content iframe:eq(3)')`
  
  Как и в остальных случаях, вторым аргументом можно указать смещение. Например,
  вызов `RenaultFrame.scroll('.content iframe:eq(3)', -50)` остановит скролл
  на 50 пикселей выше запрошенного элемента.

- Во всех вариантах скролла можно передать `true` последним аргументом, чтобы
  совершить гладкий (анимированный) скролл.
  
  Например: `RenaultFrame.scroll(document.querySelector('h1'), true);`
  
##### Скролл на родительской странице

Вызов `RenaultFrame.on('scroll', callback)` позволит функции `callback` принимать
информацию о скролле на родительской странице. Единственным аргументом передается
объект с полями:
 
- `offset` ― смещение от верхнего края текущего фрейма, в пикселях;
- `height` ― высота видимой области родительского окна, в пикселях.

(Таким образом, на экране виден фрагмент родительской страницы от `offset`
до `offset + height` пикселей.)

Например:

```
RenaultFrame.on('scroll', function (event) {
    console.log(event.offset, event.height)
})
```

Чтобы отключить отслеживание скролла, вызовите `RenaultFrame.off()` с теми же
параметрами.

##### Геолокация

На сайтах Helios по умолчанию запрещена геолокация внутри `<iframe>`, даже если
фрейм загружен по безопасному протоколу (HTTPS).

Для работы с геолокацией используйте `RenaultFrame.geolocate()` так же, как вы
использовали бы `navigator.geolocation.getCurrentPosition()`:

```
RenaultFrame.geolocate(function (position) {
    console.log(position.coords.latitude, position.coords.longitude)
}, function (error) {
    console.log(error.code, error.message)
})
```

##### Отправка сообщений в родительское окно

- `RenaultFrame.message(msg)` и `RenaultFrame.message(msg, origin)` отправлят
  произвольное сообщение в родительское окно. Отправляемое сообщение должно
  быть строкой.
  
  Например: `RenaultFrame.message('GA-page|some-action_complete')`

##### Информация о родительском окне

- Методу `RenaultFrame.getParentInfo(callback)` необходимо передать функцию,
  принимающую один аргумент. Когда родительская страница будет загружена,
  функция будет вызвана с аргументом ― объектом вида:
  
  ```json
  {
    "url": "https://www.renault.ru/..."
  }
  ```
  
  где `url` ― полный URL родительской страницы.
