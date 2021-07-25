import React, { useRef, useState, useEffect } from 'react';
import { gif_limit } from './Constant';
import AlertComponent from './components/AlertComponent';
import ColumnGifs from './components/ColumnGifs';
import SearchComponent from './components/SearchComponent';
import LoadingComponent from './components/LoadingComponent';
import useInfiniteScroll from "./useInfiniteScroll";

import './App.css';

function App() {
  const [gifs_first, setGifsFirst] = useState([]);
  const [gifs_second, setGifsSecond] = useState([]);
  const [gifs_third, setGifsThird] = useState([]);
  const [gifs_forth, setGifsForth] = useState([]);
  const [initGifs, setInitGifs] = useState([]);
  const [apiResponseState, setApiResponseState] = useState(true);
  const giphySearchUrl = 'http://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC';
  const giphyTrendingUrl = 'http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC';
  const [isInitial, setInitialState] = useState(true);
  const [apiResponseData, setApiResponseData] = useState([]);
  const [isFetching, setIsFetching] = useInfiniteScroll(fetchMoreListItems);
  const [beforeValue, setBeforeValue] = useState('');
  const [offsetVal, setOffSetVal] = useState(0);
  var beforeValue_ = '';
  var ajaxState = true;

  const [copySuccess, setCopySuccess] = useState(false);

  function fetchMoreListItems() {
    if (beforeValue) {
      var offsetValue = offsetVal + 1;
      setOffSetVal(offsetValue);
      var url = giphySearchUrl + '&q=' + beforeValue.replace(' ', '+') + `&limit=${gif_limit}&offset=${offsetValue * gif_limit}`;

      fetch(url, {
        method: 'get'
      }).then(function (response) {
        return response.json();
      }).then(function (response) {
        if (response.message == 'API rate limit exceeded') setApiResponseState(false);
        else {
          var data = response.data.map(function (g, i) {
            return g.images;
          });
          // setApiResponseData(data);
          setIsFetching(false);
          setGifsFirst(gifs_first.concat(data.slice(0, gif_limit / 4)));
          setGifsSecond(gifs_second.concat(data.slice(gif_limit / 4, (gif_limit / 4) * 2)));
          setGifsThird(gifs_third.concat(data.slice(gif_limit / 4 * 2, (gif_limit / 4) * 3)));
          setGifsForth(gifs_forth.concat(data.slice(gif_limit / 4 * 3, gif_limit)));
        }
      });
    }
  }

  const copyToClipboard = (url) => {
    var textField = document.createElement('textarea')
    textField.innerText = url
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  };

  const setGifsFunc = (url) => {
    fetch(url, {
      method: 'get'
    }).then(function (response) {
      return response.json();
    }).then(function (response) {
      if (response.message == 'API rate limit exceeded') setApiResponseState(false);
      else {
        var data = response.data.map(function (g, i) {
          return g.images;
        });
        // setApiResponseData(data);
        
        setGifsFirst(gifs_first.concat(data.slice(0, gif_limit / 4)));
        setGifsSecond(gifs_second.concat(data.slice(gif_limit / 4, (gif_limit / 4) * 2)));
        setGifsThird(gifs_third.concat(data.slice(gif_limit / 4 * 2, (gif_limit / 4) * 3)));
        setGifsForth(gifs_forth.concat(data.slice(gif_limit / 4 * 3, gif_limit)));
      }
    });
  }

  const randomGifsFunc = (url) => {
    fetch(url, {
      method: 'get'
    }).then(function (response) {
      return response.json();
    }).then(function (response) {
      if (response.message == 'API rate limit exceeded') setApiResponseState(false);
      else {
        var gifs = response.data.map(function (g, i) {
          return g.images;
        });

        var random_x = Math.ceil(Math.random() * gifs.length);
        var random_y = Math.ceil(Math.random() * gifs.length);
        var random_z = Math.ceil(Math.random() * gifs.length);
        setInitGifs([gifs[random_x], gifs[random_y], gifs[random_z]]);
      }
    });
  }

  useEffect(() => {
    randomGifsFunc(giphyTrendingUrl);
    setInterval(compareBeforeAfterValue, 1000);
  }, []);

  const compareBeforeAfterValue = () => {
    var afterValue = document.getElementById('searchKey').value;
    if (beforeValue_ == afterValue) {
      if (beforeValue_ != '' && ajaxState) {
        setOffSetVal(0);
        setGifsFirst([]);
        setGifsSecond([]);
        setGifsThird([]);
        setGifsForth([]);
        setInitialState(false);
        ajaxState = false;

        var url = giphySearchUrl + '&q=' + beforeValue_.replace(' ', '+') + `&limit=${gif_limit}&offset=${offsetVal * gif_limit}`;
        setGifsFunc(url);
      }
    }
    else {
      ajaxState = true;
    }
    setBeforeValue(afterValue);
    beforeValue_ = afterValue;
  }


  return (
    <div className="App">
      <AlertComponent copySuccess={copySuccess} apiResponseState={apiResponseState} />
      <SearchComponent /><br></br>
      <table>
        <tbody>
          <tr style={{ display: isInitial ? 'block' : 'none' }}>
            {
              initGifs.length ? initGifs.map((gif, i) => {
                return (
                  <td style={{ verticalAlign: 'top' }} className='col-md-4' key={i}>
                    <video autoPlay muted fluid="true" loop
                      onClick={() => copyToClipboard(gif.original.url)}
                      width='100%'
                      style={{ opacity: 0.8 }}
                      onMouseOver={(e) => e.target.style.opacity = 1}
                      onMouseOut={(e) => e.target.style.opacity = 0.8}
                    >
                      <source src={gif.original.mp4} type="video/mp4" />
                    </video>
                  </td>
                )
              }) : null
            }
          </tr>
          <tr style={{ display: isInitial ? 'none' : 'block' }}>
            <ColumnGifs gifs={gifs_first} copyToClipboard={copyToClipboard} classname='col-md-3' />
            <ColumnGifs gifs={gifs_second} copyToClipboard={copyToClipboard} classname='col-md-3' />
            <ColumnGifs gifs={gifs_third} copyToClipboard={copyToClipboard} classname='col-md-3' />
            <ColumnGifs gifs={gifs_forth} copyToClipboard={copyToClipboard} classname='col-md-3' />
          </tr>
        </tbody>
      </table>
      {(isFetching && !isInitial) ? <LoadingComponent /> : null}
    </div>
  );
}

export default App;
